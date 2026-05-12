import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CalendarCheck, TrendingUp, Star, Plus, ArrowRight, Clock, Bell, ArrowUp, ArrowDown, BarChart2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getStats,
  createApplication as apiCreate,
  updateApplication as apiUpdate,
  deleteApplication as apiDelete,
} from '../api/applicationService';
import { getAvatarColor, getFollowUpStatus } from '../utils/constants';
import StatusBadge from '../components/Applications/StatusBadge';
import AddApplicationModal from '../components/Applications/AddApplicationModal';
import ApplicationDetailModal from '../components/Applications/ApplicationDetailModal';
import ExportModal from '../components/Export/ExportModal';

const fmt = (d) => (d ? format(new Date(d), 'dd MMM yyyy') : '—');

const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-7 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

const CARDS = [
  {
    key: 'total',
    label: 'Total Applied',
    icon: Briefcase,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    icon: Star,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    key: 'interview',
    label: 'Interview Scheduled',
    icon: CalendarCheck,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
  },
  {
    key: 'offers',
    label: 'Offers Received',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const [stats,       setStats]       = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAdd,     setShowAdd]     = useState(false);
  const [viewingApp,  setViewingApp]  = useState(null);
  const [editingApp,  setEditingApp]  = useState(null);
  const [showExport,  setShowExport]  = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await getStats();
      setStats(data.data);
    } catch {
      // silent — stats not critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const cardValues = stats
    ? {
        total:       stats.total ?? 0,
        shortlisted: stats.byStatus?.Shortlisted ?? 0,
        interview:   stats.byStatus?.['Interview Scheduled'] ?? 0,
        offers:      stats.byStatus?.Offer ?? 0,
      }
    : { total: 0, shortlisted: 0, interview: 0, offers: 0 };

  const handleCreate = async (formData) => {
    try {
      await apiCreate(formData);
      toast.success('Application added!');
      setShowAdd(false);
      loadStats();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add application');
      throw err;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await apiUpdate(editingApp._id, formData);
      toast.success('Application updated!');
      setEditingApp(null);
      loadStats();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update application');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    await apiDelete(id);
    toast.success('Application deleted');
    setViewingApp(null);
    loadStats();
  };

  const recentApps = stats?.recentApplications ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here&apos;s a snapshot of your job search progress.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {statsLoading
          ? CARDS.map((c) => <CardSkeleton key={c.key} />)
          : CARDS.map(({ key, label, icon: Icon, color, bg, border }) => (
              <div
                key={key}
                className={`bg-white rounded-xl border ${border} p-5 shadow-sm`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${bg} p-3 rounded-xl shrink-0`}>
                    <Icon size={22} className={color} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium leading-none mb-1">{label}</p>
                    <p className={`text-3xl font-bold ${color} leading-none`}>{cardValues[key]}</p>
                  </div>
                </div>
                {key === 'total' && stats?.dailyLast7?.length > 0 && (
                  <div className="mt-3 -mx-1">
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={stats.dailyLast7}>
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* Weekly progress */}
      {!statsLoading && stats && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Your Progress This Week</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-bold text-gray-900">{stats.thisWeek}</span>
                <span className="text-sm text-gray-400">application{stats.thisWeek !== 1 ? 's' : ''} this week</span>
                {stats.lastWeek > 0 && (() => {
                  const pct = Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100);
                  const up  = pct >= 0;
                  return (
                    <span className={`flex items-center gap-0.5 text-sm font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                      {up ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {Math.abs(pct)}% vs last week
                    </span>
                  );
                })()}
                {stats.lastWeek === 0 && stats.thisWeek > 0 && (
                  <span className="text-xs text-indigo-500">Great start this week!</span>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => navigate('/kanban')}
                className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Kanban <ArrowRight size={13} />
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart2 size={13} /> Analytics
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={13} /> Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent applications */}
      {!statsLoading && recentApps.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent Applications</h2>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentApps.map((app) => {
              const avatarColor = getAvatarColor(app.company);
              return (
                <button
                  key={app._id}
                  onClick={() => setViewingApp(app)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                  >
                    {app.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{app.company}</p>
                    <p className="text-xs text-gray-400 truncate">{app.role}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-gray-400">{fmt(app.appliedDate)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : !statsLoading && recentApps.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Briefcase size={30} className="text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No applications yet</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mb-7 leading-relaxed">
            Start tracking your job applications and never lose track of an opportunity again.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              Add Your First Application
            </button>
            <button
              onClick={() => navigate('/kanban')}
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Kanban Board
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Upcoming follow-ups + upcoming interviews */}
      {!statsLoading && (stats?.upcomingFollowUps?.length > 0 || stats?.upcomingInterviews?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Follow-ups */}
          {stats?.upcomingFollowUps?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <Clock size={15} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-800">Upcoming Follow-ups</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {stats.upcomingFollowUps.map((app) => {
                  const status = getFollowUpStatus(app.followUpDate);
                  const dotClass =
                    status === 'overdue' ? 'bg-red-400'
                    : status === 'today'  ? 'bg-orange-400'
                    : typeof status === 'number' && status <= 3 ? 'bg-yellow-400'
                    : 'bg-gray-300';
                  const label =
                    status === 'overdue' ? 'Overdue'
                    : status === 'today'  ? 'Today'
                    : `in ${status}d`;
                  return (
                    <button
                      key={app._id}
                      onClick={() => setViewingApp(app)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg ${getAvatarColor(app.company)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {app.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{app.company}</p>
                        <p className="text-xs text-gray-400 truncate">{app.role}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Interviews */}
          {stats?.upcomingInterviews?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <Bell size={15} className="text-yellow-500" />
                <h2 className="text-sm font-semibold text-gray-800">Upcoming Interviews</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {stats.upcomingInterviews.map((app) => {
                  const pendingRounds = app.interviewRounds?.filter((r) => r.status === 'Pending') ?? [];
                  return (
                    <button
                      key={app._id}
                      onClick={() => setViewingApp(app)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg ${getAvatarColor(app.company)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {app.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{app.company}</p>
                        <p className="text-xs text-gray-400 truncate">{app.role}</p>
                      </div>
                      {pendingRounds.length > 0 && (
                        <span className="text-xs text-indigo-500 shrink-0">
                          {pendingRounds.length} pending
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add button (when there are apps) */}
      {!statsLoading && recentApps.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Add Application
        </button>
      )}

      {/* Modals */}
      <AddApplicationModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleCreate}
      />

      <AddApplicationModal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        onSubmit={handleUpdate}
        initialData={editingApp}
      />

      <ApplicationDetailModal
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        application={viewingApp}
        onEdit={(app) => { setViewingApp(null); setEditingApp(app); }}
        onDelete={handleDelete}
      />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
      />
    </div>
  );
};

export default DashboardPage;
