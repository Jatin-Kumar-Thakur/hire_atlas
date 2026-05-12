import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
    <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
  </section>
);

const TermsPage = () => (
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
          <FileText className="text-indigo-600" size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
          <p className="text-gray-500 text-sm mt-1">Please read these terms before using HireAtlas</p>
        </div>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using HireAtlas (the "Service"), you agree to be bound by these Terms of Service
          ("Terms"). If you do not agree, do not use the Service.
        </p>
        <p>
          We may revise these Terms at any time by updating this page. Continued use of the Service after
          any changes constitutes your acceptance of the new Terms.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          HireAtlas is a web-based job application tracking platform. It allows registered users to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Record and manage job applications from any source</li>
          <li>Visualise application status using a Kanban board</li>
          <li>Track interview rounds and outcomes</li>
          <li>View analytics about their job search activity</li>
          <li>Receive email reminders for follow-ups and upcoming interviews</li>
          <li>Save job listings from LinkedIn, Naukri, and Internshala using the Chrome Extension</li>
          <li>Export and import application data as CSV files</li>
        </ul>
        <p>
          The Service is provided free of charge. We reserve the right to introduce paid tiers, modify
          features, or discontinue the Service at any time with reasonable notice.
        </p>
      </Section>

      <Section title="3. Account Registration">
        <p>To use HireAtlas, you must register for an account. You agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate, current, and complete registration information</li>
          <li>Maintain the security of your password and accept responsibility for all activity under your account</li>
          <li>Notify us immediately of any unauthorised use of your account</li>
          <li>Not share your account credentials with any third party</li>
        </ul>
        <p>
          You must be at least 16 years old to create an account. By registering, you represent that you
          meet this requirement.
        </p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree to use HireAtlas only for lawful purposes. You must not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the Service to store or transmit any unlawful, harassing, defamatory, or harmful content</li>
          <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
          <li>Use automated scripts to create accounts, scrape data, or overload our servers</li>
          <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
          <li>Use the Service to infringe the intellectual property rights of any third party</li>
          <li>Impersonate any person or misrepresent your affiliation with any entity</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these rules without prior notice.
        </p>
      </Section>

      <Section title="5. Your Content">
        <p>
          All job application data, notes, and files you add to HireAtlas ("Your Content") remain yours.
          By using the Service, you grant us a limited, non-exclusive license to store and process Your
          Content solely to provide the Service to you.
        </p>
        <p>
          We do not claim ownership of Your Content and will not use it for advertising or share it with
          third parties beyond what is described in our <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
        </p>
        <p>
          You are responsible for the accuracy and legality of Your Content. We are not responsible for any
          errors or omissions in the data you enter.
        </p>
      </Section>

      <Section title="6. Intellectual Property">
        <p>
          The HireAtlas name, logo, user interface design, and source code are the intellectual property
          of HireAtlas and are protected by applicable copyright and trademark laws.
        </p>
        <p>
          You may not reproduce, distribute, or create derivative works based on our intellectual property
          without prior written permission, except as expressly allowed by these Terms.
        </p>
      </Section>

      <Section title="7. Privacy">
        <p>
          Your use of the Service is also governed by our{' '}
          <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, which is
          incorporated into these Terms by reference. Please read it carefully to understand how we collect,
          use, and protect your personal data.
        </p>
      </Section>

      <Section title="8. Disclaimers">
        <p>
          The Service is provided on an <strong className="text-gray-800">"as is"</strong> and{' '}
          <strong className="text-gray-800">"as available"</strong> basis without warranties of any kind,
          whether express or implied. We do not warrant that:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The Service will be uninterrupted, error-free, or secure at all times</li>
          <li>Any job application data saved through the Chrome Extension will be accurate or complete (accuracy depends on the structure of third-party job listing pages, which may change)</li>
          <li>Email reminders will always be delivered (delivery depends on third-party mail servers)</li>
        </ul>
        <p>
          HireAtlas is a personal productivity tool. It does not guarantee job placement, interview success,
          or any career outcome.
        </p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, HireAtlas shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of or inability to
          use the Service, including but not limited to loss of data, lost opportunities, or business
          interruption.
        </p>
        <p>
          Our total liability to you for any claim arising from your use of the Service shall not exceed the
          amount you paid us in the 12 months preceding the claim (which may be zero if you are on the free
          tier).
        </p>
      </Section>

      <Section title="10. Third-Party Links and Services">
        <p>
          The Service may display links to third-party websites such as LinkedIn, Naukri, and Internshala.
          These links are provided for convenience only. We have no control over those sites and are not
          responsible for their content or privacy practices.
        </p>
      </Section>

      <Section title="11. Termination">
        <p>
          You may stop using HireAtlas and request account deletion at any time by contacting us at the
          email below.
        </p>
        <p>
          We may suspend or terminate your account if you violate these Terms, or if we decide to
          discontinue the Service. In the event of termination, we will provide reasonable notice where
          possible and allow you to export your data before deletion.
        </p>
      </Section>

      <Section title="12. Governing Law">
        <p>
          These Terms are governed by the laws of <strong className="text-gray-800">India</strong>, without
          regard to conflict of law principles. Any disputes arising under these Terms shall be subject to
          the exclusive jurisdiction of the courts located in India.
        </p>
      </Section>

      <Section title="13. Changes to Terms">
        <p>
          We reserve the right to update these Terms at any time. We will notify registered users by email
          of material changes at least 14 days before they take effect. The "Last updated" date at the top
          of this page will always reflect the most recent version.
        </p>
      </Section>

      <Section title="14. Contact Us">
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
          <p className="font-semibold text-gray-800">HireAtlas</p>
          <p>Email: <a href="mailto:legal@hireatlas.app" className="text-indigo-600 hover:underline">legal@hireatlas.app</a></p>
        </div>
      </Section>

      {/* Footer nav */}
      <div className="pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
        <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
        <span>·</span>
        <Link to="/register" className="hover:text-indigo-600 transition-colors">Create Account</Link>
      </div>
    </main>
  </div>
);

export default TermsPage;
