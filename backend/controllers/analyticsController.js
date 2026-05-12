const mongoose = require('mongoose');
const Application = require('../models/Application');
const { getCached, setCache } = require('../utils/analyticsCache');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getAnalyticsSummary = async (req, res, next) => {
  try {
    const cached = getCached(req.user.id);
    if (cached) return res.json({ success: true, data: cached });

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(now.getDate() - 84);

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const [
      overviewAgg,
      byStatusAgg,
      bySourceAgg,
      weeklyAgg,
      monthlyAgg,
      topCompaniesAgg,
      interviewAgg,
      recentApps,
      avgResponseAgg,
    ] = await Promise.all([
      // 1. Counts by outcome
      Application.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            total:               { $sum: 1 },
            shortlisted:         { $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] },          1, 0] } },
            interviewScheduled:  { $sum: { $cond: [{ $eq: ['$status', 'Interview Scheduled'] },  1, 0] } },
            offers:              { $sum: { $cond: [{ $eq: ['$status', 'Offer'] },                1, 0] } },
            rejections:          { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] },             1, 0] } },
            ghosted:             { $sum: { $cond: [{ $eq: ['$status', 'Ghosted'] },              1, 0] } },
          },
        },
      ]),

      // 2. Count per status
      Application.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]),

      // 3. Count per source + response rate
      Application.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$source',
            count:     { $sum: 1 },
            responded: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Shortlisted', 'Interview Scheduled', 'Offer', 'Rejected']] },
                  1, 0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            source: '$_id',
            count: 1,
            responseRate: {
              $cond: [
                { $eq: ['$count', 0] },
                0,
                { $round: [{ $multiply: [{ $divide: ['$responded', '$count'] }, 100] }, 1] },
              ],
            },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 4. Weekly trend — last 12 weeks
      Application.aggregate([
        { $match: { userId, appliedDate: { $gte: twelveWeeksAgo } } },
        {
          $group: {
            _id: { isoYear: { $isoWeekYear: '$appliedDate' }, isoWeek: { $isoWeek: '$appliedDate' } },
            weekStart:   { $min: '$appliedDate' },
            applied:     { $sum: 1 },
            shortlisted: { $sum: { $cond: [{ $in: ['$status', ['Shortlisted', 'Interview Scheduled', 'Offer']] }, 1, 0] } },
            offers:      { $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] } },
          },
        },
        { $sort: { '_id.isoYear': 1, '_id.isoWeek': 1 } },
      ]),

      // 5. Monthly trend — last 6 months
      Application.aggregate([
        { $match: { userId, appliedDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$appliedDate' }, month: { $month: '$appliedDate' } },
            applied:     { $sum: 1 },
            shortlisted: { $sum: { $cond: [{ $in: ['$status', ['Shortlisted', 'Interview Scheduled', 'Offer']] }, 1, 0] } },
            offers:      { $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // 6. Top 5 companies by application count
      Application.aggregate([
        { $match: { userId } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$company',
            applications: { $sum: 1 },
            latestStatus: { $first: '$status' },
          },
        },
        { $sort: { applications: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, company: '$_id', applications: 1, latestStatus: 1 } },
      ]),

      // 7. Interview round stats (unwind subdocuments)
      Application.aggregate([
        { $match: { userId } },
        { $unwind: { path: '$interviewRounds', preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: null,
            totalRounds:    { $sum: 1 },
            clearedRounds:  { $sum: { $cond: [{ $eq: ['$interviewRounds.status', 'Cleared']  }, 1, 0] } },
            rejectedRounds: { $sum: { $cond: [{ $eq: ['$interviewRounds.status', 'Rejected'] }, 1, 0] } },
            pendingRounds:  { $sum: { $cond: [{ $eq: ['$interviewRounds.status', 'Pending']  }, 1, 0] } },
          },
        },
      ]),

      // 8. Recent 10 apps for activity feed
      Application.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('company role status appliedDate createdAt interviewRounds')
        .lean(),

      // 9. Average days between appliedDate and first response
      Application.aggregate([
        {
          $match: {
            userId,
            status: { $in: ['Shortlisted', 'Interview Scheduled', 'Offer', 'Rejected'] },
            appliedDate: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgDays: {
              $avg: { $divide: [{ $subtract: ['$updatedAt', '$appliedDate'] }, 86_400_000] },
            },
          },
        },
      ]),
    ]);

    const ov = overviewAgg[0] || {
      total: 0, shortlisted: 0, interviewScheduled: 0,
      offers: 0, rejections: 0, ghosted: 0,
    };
    const responded     = ov.shortlisted + ov.interviewScheduled + ov.offers + ov.rejections;
    const responseRate  = ov.total > 0 ? ((responded / ov.total) * 100).toFixed(1) : '0.0';
    const offerRate     = ov.total > 0 ? ((ov.offers  / ov.total) * 100).toFixed(1) : '0.0';
    const avgDaysToResponse = Math.round(avgResponseAgg[0]?.avgDays || 0);

    const iv = interviewAgg[0] || { totalRounds: 0, clearedRounds: 0, rejectedRounds: 0, pendingRounds: 0 };
    const clearRate = iv.totalRounds > 0 ? ((iv.clearedRounds / iv.totalRounds) * 100).toFixed(1) : '0.0';

    const weeklyTrend = weeklyAgg.map((w, i) => ({
      week:      `Week ${i + 1}`,
      weekStart: w.weekStart.toISOString().slice(0, 10),
      applied:     w.applied,
      shortlisted: w.shortlisted,
      offers:      w.offers,
    }));

    const monthlyTrend = monthlyAgg.map((m) => ({
      month:       `${MONTHS[m._id.month - 1]} ${m._id.year}`,
      applied:     m.applied,
      shortlisted: m.shortlisted,
      offers:      m.offers,
    }));

    const recentActivity = recentApps.map((app) => {
      let type   = 'applied';
      let action = `Applied to ${app.company}`;
      if (app.status === 'Interview Scheduled' && (app.interviewRounds || []).length > 0) {
        type   = 'interview';
        action = `Interview scheduled at ${app.company}`;
      } else if (app.status !== 'Applied') {
        type   = 'status_change';
        action = `${app.company} — ${app.status}`;
      }
      return { date: app.createdAt, action, type };
    });

    const result = {
      overview: {
        total: ov.total,
        shortlisted: ov.shortlisted,
        interviewScheduled: ov.interviewScheduled,
        offers: ov.offers,
        rejections: ov.rejections,
        ghosted: ov.ghosted,
        responseRate,
        offerRate,
        avgDaysToResponse,
      },
      byStatus:      byStatusAgg,
      bySource:      bySourceAgg,
      weeklyTrend,
      monthlyTrend,
      topCompanies:  topCompaniesAgg,
      interviewStats: {
        totalRounds:    iv.totalRounds,
        clearedRounds:  iv.clearedRounds,
        rejectedRounds: iv.rejectedRounds,
        pendingRounds:  iv.pendingRounds,
        clearRate,
      },
      recentActivity,
    };

    setCache(req.user.id, result);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalyticsSummary };
