const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"HireAtlas" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
  });
};

// ─── Shared base styles ───────────────────────────────────────────────────────
const base = `
  body{margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f5;}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);}
  .hdr{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;}
  .hdr-logo{color:#fff;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.8;margin:0 0 6px;}
  .hdr h1{margin:0;color:#fff;font-size:22px;font-weight:800;}
  .body{padding:28px 32px;}
  .body p{color:#374151;font-size:15px;line-height:1.7;margin:0 0 14px;}
  .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin:20px 0;}
  .card-row{display:flex;gap:8px;margin-bottom:8px;align-items:baseline;}
  .card-row:last-child{margin-bottom:0;}
  .card-label{font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;min-width:90px;}
  .card-value{font-size:14px;color:#111827;font-weight:600;}
  .btn{display:inline-block;background:#4f46e5;color:#fff!important;text-decoration:none;padding:13px 32px;border-radius:8px;font-weight:700;font-size:14px;margin:8px 0;}
  .tips{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin:20px 0;}
  .tips-title{font-size:13px;font-weight:700;color:#1d4ed8;margin:0 0 10px;}
  .tips ul{margin:0;padding-left:18px;}
  .tips ul li{font-size:13px;color:#1e40af;line-height:1.8;}
  .foot{padding:18px 32px;border-top:1px solid #e5e7eb;background:#f9fafb;}
  .foot p{margin:0;font-size:12px;color:#9ca3af;line-height:1.6;}
`;

// ─── Password reset ───────────────────────────────────────────────────────────
const forgotPasswordTemplate = ({ userName, resetUrl }) => `
<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"/><style>${base}</style></head>
<body><div class="wrap">
  <div class="hdr"><p class="hdr-logo">HireAtlas</p><h1>Reset Your Password</h1></div>
  <div class="body">
    <p>Hi ${userName},</p>
    <p>We received a request to reset your HireAtlas password. Click below to set a new one:</p>
    <p style="margin:24px 0;"><a href="${resetUrl}" class="btn">Reset Password</a></p>
    <p>This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    <p style="font-size:13px;color:#6b7280;">If the button doesn't work, copy this URL:<br/>
      <span style="color:#4f46e5;word-break:break-all;">${resetUrl}</span></p>
  </div>
  <div class="foot"><p>Sent because a password reset was requested for your HireAtlas account.</p></div>
</div></body></html>
`;

// ─── Follow-up reminder ───────────────────────────────────────────────────────
const followUpReminderTemplate = (userName, company, role) => `
<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"/><style>${base}</style></head>
<body><div class="wrap">
  <div class="hdr"><p class="hdr-logo">HireAtlas</p><h1>⏰ Time to Follow Up!</h1></div>
  <div class="body">
    <p>Hey <strong>${userName}</strong>!</p>
    <p>You set a reminder to follow up with <strong>${company}</strong> for the <strong>${role}</strong> position today.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Company</span><span class="card-value">${company}</span></div>
      <div class="card-row"><span class="card-label">Position</span><span class="card-value">${role}</span></div>
    </div>
    <p style="margin:24px 0;"><a href="${process.env.CLIENT_URL}/applications" class="btn">View Application</a></p>
    <div class="tips">
      <p class="tips-title">Quick tips for following up:</p>
      <ul>
        <li>Keep it short and professional</li>
        <li>Reference your original application date</li>
        <li>Express continued interest in the role</li>
        <li>Ask about the timeline for next steps</li>
      </ul>
    </div>
  </div>
  <div class="foot"><p>You're receiving this because you set a follow-up reminder in HireAtlas.</p></div>
</div></body></html>
`;

// ─── Interview reminder ───────────────────────────────────────────────────────
const interviewReminderTemplate = (userName, company, role, roundType, date) => `
<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"/><style>${base}</style></head>
<body><div class="wrap">
  <div class="hdr"><p class="hdr-logo">HireAtlas</p><h1>📅 Interview Tomorrow!</h1></div>
  <div class="body">
    <p>Hey <strong>${userName}</strong>!</p>
    <p>You have an interview scheduled for tomorrow. Here are the details:</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Company</span><span class="card-value">${company}</span></div>
      <div class="card-row"><span class="card-label">Role</span><span class="card-value">${role}</span></div>
      <div class="card-row"><span class="card-label">Round</span><span class="card-value">${roundType}</span></div>
      <div class="card-row"><span class="card-label">Date</span><span class="card-value">${date}</span></div>
    </div>
    <p style="margin:24px 0;"><a href="${process.env.CLIENT_URL}/applications" class="btn">View Application Details</a></p>
    <div class="tips">
      <p class="tips-title">Preparation tips:</p>
      <ul>
        <li>Review the job description one more time</li>
        <li>Prepare questions for the interviewer</li>
        <li>Test your tech setup if it's a video call</li>
        <li>Get a good night's sleep!</li>
      </ul>
    </div>
  </div>
  <div class="foot"><p>You're receiving this because you have an interview reminder set in HireAtlas.</p></div>
</div></body></html>
`;

// ─── Weekly summary ───────────────────────────────────────────────────────────
const weeklySummaryTemplate = ({ userName, total, interviews, offers }) => `
<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"/><style>
  ${base}
  .stats{display:flex;gap:12px;margin:20px 0;}
  .stat{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;}
  .stat .val{font-size:28px;font-weight:800;color:#4f46e5;}
  .stat .lbl{font-size:12px;color:#6b7280;margin-top:4px;}
</style></head>
<body><div class="wrap">
  <div class="hdr"><p class="hdr-logo">HireAtlas</p><h1>📊 Your Weekly Summary</h1></div>
  <div class="body">
    <p>Hi <strong>${userName}</strong>, here's your job search summary for this week:</p>
    <div class="stats">
      <div class="stat"><div class="val">${total}</div><div class="lbl">Applications</div></div>
      <div class="stat"><div class="val">${interviews}</div><div class="lbl">Interviews</div></div>
      <div class="stat"><div class="val">${offers}</div><div class="lbl">Offers</div></div>
    </div>
    <p style="margin:24px 0;"><a href="${process.env.CLIENT_URL}/analytics" class="btn">View Full Analytics</a></p>
  </div>
  <div class="foot"><p>You're receiving this because you enabled weekly summaries in HireAtlas.</p></div>
</div></body></html>
`;

module.exports = {
  sendEmail,
  forgotPasswordTemplate,
  followUpReminderTemplate,
  interviewReminderTemplate,
  weeklySummaryTemplate,
};
