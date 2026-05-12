import React, { useMemo } from 'react';
import KanbanColumn from './KanbanColumn';
import { STATUSES, getAvatarColor } from '../../utils/constants';
import SourceBadge from '../Applications/SourceBadge';

const COLUMN_COLORS = {
  'Applied':             'bg-blue-500',
  'Shortlisted':         'bg-purple-500',
  'Interview Scheduled': 'bg-yellow-500',
  'Offer':               'bg-green-500',
  'Rejected':            'bg-red-500',
  'Ghosted':             'bg-gray-400',
};

// Lightweight card preview rendered inside DragOverlay
// (does NOT use useDraggable — just visual)
export const CardPreview = ({ application }) => (
  <div className="bg-white rounded-xl border border-indigo-200 shadow-2xl p-3 w-72 cursor-grabbing rotate-2 opacity-95">
    <div className="flex items-center gap-2 mb-2.5">
      <div
        className={`w-8 h-8 rounded-lg ${getAvatarColor(application.company)} flex items-center justify-center text-white text-xs font-bold shrink-0`}
      >
        {application.company.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{application.company}</p>
        <p className="text-xs text-gray-500 truncate">{application.role}</p>
      </div>
    </div>
    <SourceBadge source={application.source} />
  </div>
);

const KanbanBoard = ({ applications, onView, onEdit, onDelete }) => {
  const grouped = useMemo(() => {
    const map = {};
    STATUSES.forEach((s) => { map[s] = []; });
    applications.forEach((app) => {
      if (map[app.status] !== undefined) map[app.status].push(app);
    });
    return map;
  }, [applications]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          applications={grouped[status]}
          dotColor={COLUMN_COLORS[status]}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
