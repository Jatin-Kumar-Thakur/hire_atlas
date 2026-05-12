import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { getAvatarColor, getFollowUpStatus } from '../../utils/constants';
import SourceBadge from '../Applications/SourceBadge';

// Colored dot to indicate follow-up status on the card
const FollowUpDot = ({ date }) => {
  const status = getFollowUpStatus(date);
  if (status === null) return null;

  const dotClass =
    status === 'overdue' ? 'bg-red-400'
    : status === 'today'  ? 'bg-orange-400'
    : typeof status === 'number' && status <= 3 ? 'bg-yellow-400'
    : 'bg-gray-300';

  const label =
    status === 'overdue' ? 'Follow-up overdue'
    : status === 'today'  ? 'Follow up today'
    : `Follow-up in ${status}d`;

  return (
    <span title={label} className="flex items-center gap-1 text-xs text-gray-400">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
      <span className="hidden sm:inline">{
        status === 'overdue' ? 'Overdue' :
        status === 'today'   ? 'Today'   :
        `${status}d`
      }</span>
    </span>
  );
};

const KanbanCard = React.memo(({ application, onView, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application._id,
    data: { application },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity:   isDragging ? 0 : 1,
    touchAction: 'none',
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const act = (fn) => (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    fn(application);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm relative group transition-shadow ${
        isDragging ? '' : 'hover:shadow-md hover:border-indigo-100'
      }`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="p-3 cursor-grab active:cursor-grabbing select-none"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5 pr-5">
          <div className={`w-8 h-8 rounded-lg ${getAvatarColor(application.company)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {application.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {application.company}
            </p>
            <p className="text-xs text-gray-500 truncate">{application.role}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={application.source} />
          {application.appliedDate && (
            <span className="text-xs text-gray-400">
              {format(new Date(application.appliedDate), 'dd MMM')}
            </span>
          )}
          {application.interviewRounds?.length > 0 && (
            <span className="text-xs text-indigo-400">
              {application.interviewRounds.length} round{application.interviewRounds.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Follow-up indicator */}
        {application.followUpDate && (
          <div className="mt-2">
            <FollowUpDot date={application.followUpDate} />
          </div>
        )}
      </div>

      {/* 3-dot menu */}
      <div className="absolute top-2 right-2">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleMenuToggle}
          className="p-1 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
          aria-label="Card actions"
        >
          <MoreVertical size={14} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onPointerDown={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-7 z-50 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-32">
              <button onClick={act(onView)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Eye size={13} /> View
              </button>
              <button onClick={act(onEdit)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={act(onDelete)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

KanbanCard.displayName = 'KanbanCard';
export default KanbanCard;
