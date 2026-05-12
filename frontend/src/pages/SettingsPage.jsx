import React, { useState } from 'react';
import { User, Lock, Bell, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
        <Icon size={16} className="text-indigo-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState(false);
  const [weekly, setWeekly] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your profile and preferences</p>
      </div>

      <div className="space-y-5">
        <Section icon={User} title="Profile">
          <div className="space-y-4">
            {[
              { label: 'Full Name',      value: user?.name || '' },
              { label: 'Email Address',  value: user?.email || '' },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                <input
                  type="text"
                  defaultValue={value}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Profile editing coming in Phase 1 update.</p>
        </Section>

        <Section icon={Lock} title="Password">
          <p className="text-sm text-gray-400">
            Use{' '}
            <a href="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot Password
            </a>{' '}
            to reset your password. In-settings change coming soon.
          </p>
        </Section>

        <Section icon={Bell} title="Email Notifications">
          <div className="space-y-4">
            {[
              { label: 'Follow-up reminders', desc: "Get notified when it's time to follow up", state: reminders, set: setReminders },
              { label: 'Weekly summary',       desc: 'Receive a weekly digest of your progress',  state: weekly,    set: setWeekly },
            ].map(({ label, desc, state, set }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => set((v) => !v)}
                  className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${state ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${state ? 'translate-x-4' : ''}`}
                  />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Email delivery wired up in Phase 5.</p>
        </Section>

        <Section icon={Database} title="Data Management">
          <div className="flex gap-3">
            <button disabled className="text-sm border border-gray-200 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
              Export CSV
            </button>
            <button disabled className="text-sm border border-gray-200 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
              Import CSV
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Export / import coming in Phase 4.</p>
        </Section>
      </div>
    </div>
  );
};

export default SettingsPage;
