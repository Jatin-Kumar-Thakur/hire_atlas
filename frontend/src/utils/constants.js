export const STATUSES = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Offer',
  'Rejected',
  'Ghosted',
];

export const SOURCES = [
  'LinkedIn',
  'Naukri',
  'Internshala',
  'Company Website',
  'Referral',
  'AngelList',
  'Other',
];

export const STATUS_COLORS = {
  'Applied':              'bg-blue-100 text-blue-700',
  'Shortlisted':          'bg-purple-100 text-purple-700',
  'Interview Scheduled':  'bg-yellow-100 text-yellow-700',
  'Offer':                'bg-green-100 text-green-700',
  'Rejected':             'bg-red-100 text-red-700',
  'Ghosted':              'bg-gray-100 text-gray-600',
};

export const SOURCE_COLORS = {
  'LinkedIn':         'bg-blue-100 text-blue-800',
  'Naukri':           'bg-orange-100 text-orange-700',
  'Internshala':      'bg-teal-100 text-teal-700',
  'Referral':         'bg-pink-100 text-pink-700',
  'Company Website':  'bg-indigo-100 text-indigo-700',
  'AngelList':        'bg-violet-100 text-violet-700',
  'Other':            'bg-gray-100 text-gray-600',
};

// Deterministic avatar colour from company initial
const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500',  'bg-blue-500',  'bg-indigo-500',
  'bg-violet-500', 'bg-pink-500',
];

export const getAvatarColor = (name = '') =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export const INTERVIEW_TYPES     = ['DSA', 'System Design', 'Technical', 'HR', 'Assignment', 'Culture Fit', 'Other'];
export const INTERVIEW_STATUSES  = ['Pending', 'Cleared', 'Rejected'];

/**
 * Returns 'overdue', 'today', or the number of days remaining.
 * Returns null if no date is provided.
 */
export const getFollowUpStatus = (date) => {
  if (!date) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d     = new Date(date); d.setHours(0, 0, 0, 0);
  const diff  = Math.round((d - today) / 86_400_000);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  return diff; // positive number = days remaining
};
