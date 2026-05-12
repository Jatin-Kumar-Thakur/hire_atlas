import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
    <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
  </section>
);

const PrivacyPage = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Top nav */}
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} />
          Back to HireAtlas
        </Link>
        <span className="text-xs text-gray-400">Last updated: May 12, 2026</span>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
          <Shield className="text-indigo-600" size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mt-1">How HireAtlas collects, uses, and protects your data</p>
        </div>
      </div>

      <Section title="1. Introduction">
        <p>
          HireAtlas ("we", "our", or "us") is committed to protecting your personal information. This Privacy
          Policy explains what data we collect when you use HireAtlas, how we use it, and what rights you
          have over it.
        </p>
        <p>
          By creating an account or using the HireAtlas web application or Chrome Extension, you agree to the
          practices described in this policy.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p><strong className="text-gray-800">Account Information</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Full name and email address (provided at registration)</li>
          <li>Hashed password (we never store your password in plain text)</li>
        </ul>

        <p className="pt-2"><strong className="text-gray-800">Job Application Data</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Company name, role, application status, source, location, notes</li>
          <li>Job URL (scraped by the Chrome Extension when you save a listing)</li>
          <li>Interview rounds, dates, and outcomes you add manually</li>
          <li>Follow-up reminder dates</li>
        </ul>

        <p className="pt-2"><strong className="text-gray-800">Usage Data</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Request logs (IP address, browser, pages visited) collected by our server for security and debugging</li>
          <li>We do not use third-party analytics or tracking pixels</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-gray-800">To provide the service</strong> — your application data is stored so you can view, edit, and manage it across devices.</li>
          <li><strong className="text-gray-800">To send email reminders</strong> — if you set a follow-up or interview reminder, we send a transactional email to the address on your account.</li>
          <li><strong className="text-gray-800">To send your weekly summary</strong> — if enabled in Settings, we send a weekly digest of your job search activity.</li>
          <li><strong className="text-gray-800">Password reset</strong> — if you request a password reset, we send a time-limited link to your registered email.</li>
          <li><strong className="text-gray-800">Security</strong> — server logs help us detect and respond to abuse or unauthorized access.</li>
        </ul>
        <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
      </Section>

      <Section title="4. Data Storage and Security">
        <p>
          Your data is stored in a <strong className="text-gray-800">MongoDB Atlas</strong> cloud database
          hosted on servers in the region you selected at signup. We apply the following security measures:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Passwords are hashed using <strong className="text-gray-800">bcrypt</strong> before storage — we cannot recover your plain-text password.</li>
          <li>All communication between your browser and our API uses <strong className="text-gray-800">HTTPS/TLS</strong>.</li>
          <li>Authentication uses short-lived <strong className="text-gray-800">JSON Web Tokens (JWT)</strong> stored only in your browser's localStorage — not cookies.</li>
          <li>API endpoints are rate-limited to prevent brute-force attacks.</li>
          <li>HTTP security headers are set via <strong className="text-gray-800">Helmet.js</strong>.</li>
        </ul>
        <p>
          Despite these measures, no system is 100% secure. If you suspect your account has been compromised,
          change your password immediately via Settings.
        </p>
      </Section>

      <Section title="5. Third-Party Services">
        <p>HireAtlas uses the following third-party infrastructure providers:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-700">Service</th>
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-700">Purpose</th>
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-700">Data Shared</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['MongoDB Atlas', 'Database hosting', 'All application data (encrypted at rest)'],
                ['Render', 'Backend API hosting', 'Server logs'],
                ['Vercel', 'Frontend hosting', 'Static files only, no personal data'],
                ['Gmail / SMTP', 'Transactional emails', 'Your email address and reminder content'],
              ].map(([svc, purpose, data]) => (
                <tr key={svc} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border border-gray-200 font-medium text-gray-800">{svc}</td>
                  <td className="px-3 py-2 border border-gray-200">{purpose}</td>
                  <td className="px-3 py-2 border border-gray-200">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">Each provider has its own privacy policy governing their handling of data.</p>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the following rights regarding your data:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-gray-800">Access</strong> — log in to view all your data at any time.</li>
          <li><strong className="text-gray-800">Export</strong> — download all your application data as a CSV file via the Applications page → Export.</li>
          <li><strong className="text-gray-800">Correction</strong> — edit any application or account detail directly in the app.</li>
          <li><strong className="text-gray-800">Deletion</strong> — delete individual applications at any time. To delete your entire account and all associated data, contact us at the email below.</li>
          <li><strong className="text-gray-800">Opt-out of emails</strong> — disable follow-up and weekly summary emails in Settings → Notifications.</li>
        </ul>
      </Section>

      <Section title="7. Cookies and Local Storage">
        <p>
          HireAtlas does <strong className="text-gray-800">not</strong> use tracking cookies or advertising
          cookies.
        </p>
        <p>
          We store your authentication token in <strong className="text-gray-800">localStorage</strong> so
          you stay logged in between sessions. The Chrome Extension uses{' '}
          <strong className="text-gray-800">chrome.storage.local</strong> for the same purpose. You can
          clear this by logging out or clearing your browser storage.
        </p>
      </Section>

      <Section title="8. Data Retention">
        <p>
          We retain your account and application data for as long as your account is active. If you request
          account deletion, we will remove all personally identifiable data within 30 days, except where
          we are required to retain it by law.
        </p>
        <p>
          Server access logs are retained for up to 90 days for security purposes.
        </p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>
          HireAtlas is intended for users who are 16 years of age or older. We do not knowingly collect
          personal information from children under 16. If we become aware that we have done so, we will
          delete the data promptly.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. When we do, we will update the "Last updated"
          date at the top of this page. Continued use of HireAtlas after changes are posted constitutes your
          acceptance of the updated policy.
        </p>
      </Section>

      <Section title="11. Contact Us">
        <p>
          If you have any questions about this Privacy Policy or wish to exercise your data rights, please
          contact us at:
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
          <p className="font-semibold text-gray-800">HireAtlas</p>
          <p>Email: <a href="mailto:privacy@hireatlas.app" className="text-indigo-600 hover:underline">privacy@hireatlas.app</a></p>
        </div>
      </Section>

      {/* Footer nav */}
      <div className="pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
        <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
        <span>·</span>
        <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
        <span>·</span>
        <Link to="/register" className="hover:text-indigo-600 transition-colors">Create Account</Link>
      </div>
    </main>
  </div>
);

export default PrivacyPage;
