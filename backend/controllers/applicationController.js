const mongoose = require('mongoose');
const { Readable } = require('stream');
const { createObjectCsvStringifier } = require('csv-writer');
const csv = require('csv-parser');
const { format } = require('date-fns');
const Application = require('../models/Application');
const { invalidateCache } = require('../utils/analyticsCache');

const VALID_STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer', 'Rejected', 'Ghosted'];
const VALID_SOURCES  = ['LinkedIn', 'Naukri', 'Internshala', 'Company Website', 'Referral', 'AngelList', 'Other'];

const ALLOWED_SORT = ['createdAt', 'updatedAt', 'appliedDate', 'company', 'role', 'status'];

// ── List ──────────────────────────────────────────────────────────────────────
const getAllApplications = async (req, res, next) => {
  try {
    const {
      search, status, source, startDate, endDate,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 10,
    } = req.query;

    const query = { userId: req.user.id };

    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role:    { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (source) query.source = source;
    if (startDate || endDate) {
      query.appliedDate = {};
      if (startDate) query.appliedDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.appliedDate.$lte = end;
      }
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;
    const sortField = ALLOWED_SORT.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir   = sortOrder === 'asc' ? 1 : -1;

    const [applications, total] = await Promise.all([
      Application.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum).lean(),
      Application.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, limit: limitNum },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Create ────────────────────────────────────────────────────────────────────
const createApplication = async (req, res, next) => {
  try {
    const application = await Application.create({ ...req.body, userId: req.user.id });
    invalidateCache(req.user.id);
    res.status(201).json({ success: true, message: 'Application created successfully', data: application });
  } catch (err) {
    next(err);
  }
};

// ── Stats ─────────────────────────────────────────────────────────────────────
const getApplicationStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek  = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const [statusAgg, sourceAgg, countAgg, recentApps, upcomingFollowUps, upcomingInterviews] =
      await Promise.all([
        Application.aggregate([
          { $match: { userId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Application.aggregate([
          { $match: { userId } },
          { $group: { _id: '$source', count: { $sum: 1 } } },
        ]),
        Application.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              total:     { $sum: 1 },
              thisMonth: { $sum: { $cond: [{ $gte: ['$appliedDate', startOfMonth] }, 1, 0] } },
              thisWeek:  { $sum: { $cond: [{ $gte: ['$appliedDate', startOfWeek]  }, 1, 0] } },
              lastWeek: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ['$appliedDate', new Date(startOfWeek.getTime() - 7 * 86_400_000)] },
                        { $lt:  ['$appliedDate', startOfWeek] },
                      ],
                    },
                    1, 0,
                  ],
                },
              },
            },
          },
        ]),
        Application.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
        // Next 3 follow-ups due today or later
        Application.find({ userId, followUpDate: { $gte: today } })
          .sort({ followUpDate: 1 })
          .limit(3)
          .lean(),
        // Next 3 upcoming interviews
        Application.find({ userId, status: 'Interview Scheduled' })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
      ]);

    const byStatus = {};
    statusAgg.forEach(({ _id, count }) => { byStatus[_id] = count; });

    const bySource = {};
    sourceAgg.forEach(({ _id, count }) => { bySource[_id] = count; });

    const totals = countAgg[0] || { total: 0, thisMonth: 0, thisWeek: 0, lastWeek: 0 };

    // Build 7-day sparkline (fill zeros for days with no activity)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const dailyRaw = await Application.aggregate([
      { $match: { userId, appliedDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyMap = {};
    dailyRaw.forEach((d) => { dailyMap[d._id] = d.count; });

    const dailyLast7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyLast7.push({ date: key, count: dailyMap[key] || 0 });
    }

    res.json({
      success: true,
      data: {
        total:      totals.total,
        thisMonth:  totals.thisMonth,
        thisWeek:   totals.thisWeek,
        lastWeek:   totals.lastWeek,
        dailyLast7,
        byStatus,
        bySource,
        recentApplications: recentApps,
        upcomingFollowUps,
        upcomingInterviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get one ───────────────────────────────────────────────────────────────────
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// ── Update ────────────────────────────────────────────────────────────────────
const updateApplication = async (req, res, next) => {
  try {
    const { userId, _id, createdAt, ...updateData } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    invalidateCache(req.user.id);
    res.json({ success: true, message: 'Application updated successfully', data: application });
  } catch (err) {
    next(err);
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    invalidateCache(req.user.id);
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Interview Rounds ──────────────────────────────────────────────────────────

const addInterviewRound = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const { type, date, status = 'Pending', notes = '' } = req.body;

    const maxRound = application.interviewRounds.reduce(
      (max, r) => Math.max(max, r.roundNumber), 0,
    );

    application.interviewRounds.push({ roundNumber: maxRound + 1, type, date, status, notes });
    await application.save();

    res.status(201).json({ success: true, message: 'Interview round added', data: application });
  } catch (err) {
    next(err);
  }
};

const updateInterviewRound = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const round = application.interviewRounds.id(req.params.roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Interview round not found' });
    }

    const { type, date, status, notes } = req.body;
    if (type   !== undefined) round.type   = type;
    if (date   !== undefined) round.date   = date;
    if (status !== undefined) round.status = status;
    if (notes  !== undefined) round.notes  = notes;

    await application.save();
    res.json({ success: true, message: 'Interview round updated', data: application });
  } catch (err) {
    next(err);
  }
};

const deleteInterviewRound = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const idx = application.interviewRounds.findIndex(
      (r) => r._id.toString() === req.params.roundId,
    );
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Interview round not found' });
    }

    application.interviewRounds.splice(idx, 1);
    // Re-number remaining rounds sequentially
    application.interviewRounds.forEach((r, i) => { r.roundNumber = i + 1; });
    await application.save();

    res.json({ success: true, message: 'Interview round deleted', data: application });
  } catch (err) {
    next(err);
  }
};

// ── Quick-add (Chrome Extension) ─────────────────────────────────────────────
const quickAddApplication = async (req, res, next) => {
  try {
    const { company, role, source, status, location, notes, jobUrl } = req.body;
    const application = await Application.create({
      company,
      role,
      source:   source   || 'Other',
      status:   status   || 'Applied',
      location: location || null,
      notes:    notes    || '',
      jobUrl:   jobUrl   || null,
      addedVia: 'extension',
      userId:   req.user.id,
    });
    invalidateCache(req.user.id);
    res.status(201).json({
      success: true,
      message: 'Application saved via extension',
      data: {
        _id:     application._id,
        company: application.company,
        role:    application.role,
        status:  application.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Export CSV ────────────────────────────────────────────────────────────────
const exportApplications = async (req, res, next) => {
  try {
    const { status, source, startDate, endDate } = req.query;
    const query = { userId: req.user.id };
    if (status) query.status = status;
    if (source) query.source = source;
    if (startDate || endDate) {
      query.appliedDate = {};
      if (startDate) query.appliedDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.appliedDate.$lte = end;
      }
    }

    const applications = await Application.find(query).sort({ appliedDate: -1 }).lean();

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'company',              title: 'Company' },
        { id: 'role',                 title: 'Role' },
        { id: 'source',               title: 'Source' },
        { id: 'status',               title: 'Status' },
        { id: 'location',             title: 'Location' },
        { id: 'salary',               title: 'Salary' },
        { id: 'appliedDate',          title: 'Applied Date' },
        { id: 'followUpDate',         title: 'Follow-up Date' },
        { id: 'jobUrl',               title: 'Job URL' },
        { id: 'notes',                title: 'Notes' },
        { id: 'interviewRoundsCount', title: 'Interview Rounds Count' },
        { id: 'createdAt',            title: 'Created At' },
      ],
    });

    const fmtDate = (d) => (d ? format(new Date(d), 'yyyy-MM-dd') : '');

    const records = applications.map((app) => ({
      company:              app.company,
      role:                 app.role,
      source:               app.source || '',
      status:               app.status,
      location:             app.location || '',
      salary:               app.salary || '',
      appliedDate:          fmtDate(app.appliedDate),
      followUpDate:         fmtDate(app.followUpDate),
      jobUrl:               app.jobUrl || '',
      notes:                (app.notes || '').replace(/[\r\n]+/g, ' '),
      interviewRoundsCount: (app.interviewRounds || []).length,
      createdAt:            fmtDate(app.createdAt),
    }));

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="applications-${dateStr}.csv"`);
    res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records));
  } catch (err) {
    next(err);
  }
};

// ── Import CSV ────────────────────────────────────────────────────────────────
const importApplications = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file provided' });
    }

    const parseDate = (d) => {
      if (!d || !d.trim()) return null;
      const p = new Date(d.trim());
      return isNaN(p.getTime()) ? null : p;
    };

    const rows = await new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(req.file.buffer.toString('utf-8'));
      stream
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    const validDocs = [];
    const errors    = [];

    rows.forEach((row, idx) => {
      const rowNum  = idx + 2; // 1-indexed + header row
      const company = (row['Company'] || '').trim();
      const role    = (row['Role']    || '').trim();

      if (!company) { errors.push({ row: rowNum, message: 'Missing company name' }); return; }
      if (!role)    { errors.push({ row: rowNum, message: 'Missing job role' });     return; }

      let status = (row['Status'] || 'Applied').trim();
      if (!VALID_STATUSES.includes(status)) status = 'Applied';

      let source = (row['Source'] || 'Other').trim();
      if (!VALID_SOURCES.includes(source)) source = 'Other';

      validDocs.push({
        userId:      req.user.id,
        company,
        role,
        source,
        status,
        location:    (row['Location'] || '').trim()   || null,
        salary:      (row['Salary']   || '').trim()   || null,
        appliedDate: parseDate(row['Applied Date'])    || new Date(),
        followUpDate:parseDate(row['Follow-up Date']),
        jobUrl:      (row['Job URL']  || '').trim()   || null,
        notes:       (row['Notes']    || '').trim(),
      });
    });

    if (validDocs.length > 0) {
      await Application.insertMany(validDocs, { ordered: false });
      invalidateCache(req.user.id);
    }

    res.json({
      success: true,
      data: {
        imported: validDocs.length,
        skipped:  errors.length,
        errors,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllApplications,
  createApplication,
  quickAddApplication,
  getApplicationStats,
  getApplicationById,
  updateApplication,
  deleteApplication,
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  exportApplications,
  importApplications,
};
