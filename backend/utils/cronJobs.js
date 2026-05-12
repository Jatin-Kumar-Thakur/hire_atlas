const cron = require('node-cron');
const { format } = require('date-fns');
const Application  = require('../models/Application');
const Notification = require('../models/Notification');
const { sendEmail, followUpReminderTemplate, interviewReminderTemplate } = require('./sendEmail');

const initCronJobs = () => {

  // ── Follow-up reminders — daily at 09:00 ────────────────────────────────────
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Follow-up reminder job started');

    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    let sent = 0, errs = 0;

    try {
      const apps = await Application.find({
        followUpDate: { $gte: today, $lt: tomorrow },
        reminderSent: false,
      }).populate('userId', 'name email');

      for (const app of apps) {
        try {
          await sendEmail({
            to:      app.userId.email,
            subject: `⏰ Follow up with ${app.company} today!`,
            html:    followUpReminderTemplate(app.userId.name, app.company, app.role),
          });
        } catch (emailErr) {
          console.error(`[CRON] Email failed for ${app._id}:`, emailErr.message);
        }

        // Always create notification and mark sent — even if email fails
        try {
          await Notification.create({
            userId:        app.userId._id,
            applicationId: app._id,
            type:          'follow_up_reminder',
            title:         `Follow up with ${app.company}`,
            message:       `Don't forget to follow up on your ${app.role} application at ${app.company}.`,
          });
          app.reminderSent = true;
          await app.save();
          sent++;
        } catch (notifErr) {
          console.error(`[CRON] Notification failed for ${app._id}:`, notifErr.message);
          errs++;
        }
      }
    } catch (err) {
      console.error('[CRON] Follow-up job fatal error:', err.message);
    }

    console.log(`[CRON] Follow-up reminders: ${sent} processed, ${errs} errors`);
  });

  // ── Interview reminders — daily at 08:00 ────────────────────────────────────
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Interview reminder job started');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tStart = new Date(tomorrow); tStart.setHours(0, 0, 0, 0);
    const tEnd   = new Date(tomorrow); tEnd.setHours(23, 59, 59, 999);

    let sent = 0, errs = 0;

    try {
      const apps = await Application.find({
        status: 'Interview Scheduled',
        interviewRounds: { $elemMatch: { date: { $gte: tStart, $lte: tEnd }, status: 'Pending' } },
      }).populate('userId', 'name email');

      for (const app of apps) {
        const dueRounds = app.interviewRounds.filter(
          (r) => r.status === 'Pending' && r.date >= tStart && r.date <= tEnd,
        );

        for (const round of dueRounds) {
          const formattedDate = format(new Date(round.date), 'dd MMM yyyy, h:mm a');

          try {
            await sendEmail({
              to:      app.userId.email,
              subject: `📅 Interview reminder: ${app.company} tomorrow`,
              html:    interviewReminderTemplate(
                app.userId.name, app.company, app.role, round.type, formattedDate,
              ),
            });
          } catch (emailErr) {
            console.error(`[CRON] Interview email failed for round ${round._id}:`, emailErr.message);
          }

          try {
            await Notification.create({
              userId:        app.userId._id,
              applicationId: app._id,
              type:          'interview_reminder',
              title:         `Interview tomorrow: ${app.company}`,
              message:       `${round.type} round for ${app.role} at ${app.company} — ${formattedDate}`,
            });
            sent++;
          } catch (notifErr) {
            console.error(`[CRON] Interview notification failed:`, notifErr.message);
            errs++;
          }
        }
      }
    } catch (err) {
      console.error('[CRON] Interview reminder job fatal error:', err.message);
    }

    console.log(`[CRON] Interview reminders: ${sent} processed, ${errs} errors`);
  });

  // ── Weekly summary — every Monday at 08:00 ──────────────────────────────────
  cron.schedule('0 8 * * 1', async () => {
    console.log('[CRON] Weekly summary job triggered (stub — Phase 5)');
  });

  console.log('[CRON] Scheduled jobs initialised');
};

module.exports = { initCronJobs };
