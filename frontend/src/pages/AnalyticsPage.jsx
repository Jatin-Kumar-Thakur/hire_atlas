import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, TrendingUp, Trophy, Calendar, CheckCircle, Clock,
  RefreshCw, Plus, BarChart2,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, LabelList,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { getSummary } from '../api/analyticsService';
import { getAvatarColor } from '../utils/constants';
import StatusBadge from '../components/Applications/StatusBadge';

// ─── Chart color maps ─────────────────────────────────────────────────────────

const STATUS_HEX = {
  'Applied':             '#3b82f6',
  'Shortlisted':         '#a855f7',
  'Interview Scheduled': '#eab308',
  'Offer':               '#22c55e',
  'Rejected':            '#ef4444',
  'Ghosted':             '#6b7280',
};

const SOURCE_HEX = {
  'LinkedIn':        '#3b82f6',
  'Naukri':          '#f97316',
  'Internshala':     '#14b8a6',
  'Referral':        '#ec4899',
  'Company Website': '#6366f1',
  'AngelList':       '#7c3aed',
  'Other':           '#6b7280',
};

const ACTIVITY_META = {
  applied:       { Icon: Briefcase,  color: 'text-blue-500',   bg: 'bg-blue-50'   },
  status_change: { Icon: RefreshCw,  color: 'text-purple-500', bg: 'bg-purple-50' },
  interview:     { Icon: Calendar,   color: 'text-yellow-500', bg: 'bg-yellow-50' },
};

// ─── Shared custom tooltip ────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 mb-0.5" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-7 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

const ChartSkeleton = ({ height = 300 }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-1/4 mb-6" />
    <div className="bg-gray-100 rounded-lg" style={{ height }} />
  </div>
);

const SkeletonPage = () => (
  <div className="p-6 lg:p-8 max-w-7xl space-y-8">
    <div className="h-8 bg-gray-100 rounded w-48 animate-pulse" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
    <ChartSkeleton height={300} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton height={260} />
      <ChartSkeleton height={260} />
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }) => (
  <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
      <BarChart2 size={36} className="text-indigo-400" />
    </div>
    <h2 className="text-xl font-bold text-gray-800 mb-2">No data yet</h2>
    <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
      Start tracking your job applications to see insights and analytics here.
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
    >
      <Plus size={16} /> Add Application
    </button>
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-semibold text-gray-800">{children}</h2>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [trendView, setTrendView] = useState('weekly');

  const load = useCallback(async () => {
    try {
      const { data } = await getSummary();
      setSummary(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <SkeletonPage />;
  if (!summary || summary.overview.total === 0) return <EmptyState onAdd={() => navigate('/applications')} />;

  const { overview, byStatus, bySource, weeklyTrend, monthlyTrend, topCompanies, interviewStats, recentActivity } = summary;

  // ── Overview card config ──────────────────────────────────────────────────
  const rr = parseFloat(overview.responseRate);
  const rrColor = rr >= 30 ? 'text-green-600' : rr >= 15 ? 'text-yellow-600' : 'text-red-600';

  const overviewCards = [
    { label: 'Total Applications',    value: overview.total,                  sub: 'All time',                   Icon: Briefcase,    iconCls: 'text-blue-500',   bg: 'bg-blue-50'   },
    { label: 'Response Rate',         value: `${overview.responseRate}%`,     sub: 'Companies that responded',   Icon: TrendingUp,   iconCls: 'text-purple-500', bg: 'bg-purple-50', valueCls: rrColor },
    { label: 'Offer Rate',            value: `${overview.offerRate}%`,        sub: 'Applications → Offers',      Icon: Trophy,       iconCls: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Interviews',            value: overview.interviewScheduled,     sub: 'Scheduled or completed',     Icon: Calendar,     iconCls: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Interview Clear Rate',  value: `${interviewStats.clearRate}%`,  sub: 'Rounds cleared',             Icon: CheckCircle,  iconCls: 'text-green-500',  bg: 'bg-green-50'  },
    { label: 'Avg Response Time',     value: `${overview.avgDaysToResponse} days`, sub: 'Average days to response', Icon: Clock,   iconCls: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  // ── Trend chart data ──────────────────────────────────────────────────────
  const trendData = trendView === 'weekly' ? weeklyTrend : monthlyTrend;
  const trendKey  = trendView === 'weekly' ? 'week' : 'month';

  // ── Donut chart data ──────────────────────────────────────────────────────
  const pieData = byStatus.map((item) => ({
    name:  item.status,
    value: item.count,
    color: STATUS_HEX[item.status] || '#6b7280',
  }));

  // ── Source bar chart data ─────────────────────────────────────────────────
  const barData = bySource.map((item) => ({
    ...item,
    color: SOURCE_HEX[item.source] || '#6b7280',
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visualise your job search performance</p>
      </div>

      {/* ── Section 1: Overview cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {overviewCards.map(({ label, value, sub, Icon, iconCls, bg, valueCls }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${bg} p-3 rounded-xl shrink-0`}>
              <Icon size={20} className={iconCls} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium leading-none mb-1">{label}</p>
              <p className={`text-2xl font-bold leading-none ${valueCls || 'text-gray-900'}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section 2: Application Trend ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <SectionTitle>Application Trend</SectionTitle>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {['weekly', 'monthly'].map((v) => (
              <button
                key={v}
                onClick={() => setTrendView(v)}
                className={`px-4 py-1.5 transition-colors capitalize ${
                  trendView === v ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey={trendKey} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="applied"     name="Applied"     stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="offers"      name="Offers"      stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Section 3: Status donut + Source bar ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Status Breakdown</SectionTitle>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-gray-400">No data</div>
          ) : (
            <div className="flex items-center gap-4 mt-4">
              <div className="relative shrink-0">
                <PieChart width={200} height={200}>
                  <Pie
                    data={pieData}
                    cx={95} cy={95}
                    innerRadius={60} outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} (${overview.total > 0 ? ((value / overview.total) * 100).toFixed(1) : 0}%)`,
                      name,
                    ]}
                  />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-gray-900 leading-none">{overview.total}</p>
                  <p className="text-xs text-gray-400 mt-0.5">total</p>
                </div>
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                      <span className="text-gray-600 truncate">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 shrink-0">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Horizontal bar chart — sources */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Applications by Source</SectionTitle>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-gray-400">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="source" width={85} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} applications (${props.payload.responseRate}% response)`,
                    props.payload.source,
                  ]}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: '#6b7280' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Section 4: Interview stats + Top companies ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Interview performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Interview Performance</SectionTitle>
          {interviewStats.totalRounds === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">No interview rounds yet</div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Rounds',  value: interviewStats.totalRounds,    color: 'text-gray-800' },
                  { label: 'Cleared',       value: interviewStats.clearedRounds,  color: 'text-green-600' },
                  { label: 'Rejected',      value: interviewStats.rejectedRounds, color: 'text-red-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center bg-gray-50 rounded-xl py-4">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Clear rate</span>
                  <span className="font-semibold text-gray-800">{interviewStats.clearRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, parseFloat(interviewStats.clearRate))}%` }}
                  />
                </div>
              </div>

              {interviewStats.pendingRounds > 0 && (
                <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
                  {interviewStats.pendingRounds} round{interviewStats.pendingRounds !== 1 ? 's' : ''} pending outcome
                </p>
              )}
            </div>
          )}
        </div>

        {/* Top companies */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Top Companies Applied To</SectionTitle>
          {topCompanies.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">No data</div>
          ) : (
            <div className="mt-4 space-y-3">
              {topCompanies.map((co, i) => (
                <div key={co.company} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                    {i + 1}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${getAvatarColor(co.company)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {co.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{co.company}</p>
                    <p className="text-xs text-gray-400">{co.applications} application{co.applications !== 1 ? 's' : ''}</p>
                  </div>
                  <StatusBadge status={co.latestStatus} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 5: Recent Activity ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionTitle>Recent Activity</SectionTitle>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400 mt-4 text-center py-8">No activity yet</p>
        ) : (
          <div className="mt-4 space-y-4">
            {recentActivity.map((item, i) => {
              const meta = ACTIVITY_META[item.type] || ACTIVITY_META.applied;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <meta.Icon size={14} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{item.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    </p>
                  </div>
                  {i < recentActivity.length - 1 && (
                    <div className="absolute left-[30px] mt-8 w-px h-4 bg-gray-100" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default AnalyticsPage;
