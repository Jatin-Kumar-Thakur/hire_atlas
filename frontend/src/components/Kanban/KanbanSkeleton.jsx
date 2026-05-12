import React from 'react';
import { STATUSES } from '../../utils/constants';

const COLUMN_COLORS = {
  'Applied':             'bg-blue-500',
  'Shortlisted':         'bg-purple-500',
  'Interview Scheduled': 'bg-yellow-500',
  'Offer':               'bg-green-500',
  'Rejected':            'bg-red-500',
  'Ghosted':             'bg-gray-400',
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-5 bg-gray-100 rounded-full w-16" />
      <div className="h-5 bg-gray-100 rounded w-12" />
    </div>
  </div>
);

const KanbanSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-4 items-start">
    {STATUSES.map((status) => (
      <div key={status} className="flex-shrink-0 w-72 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 px-1 animate-pulse">
          <div className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[status]}`} />
          <div className="h-4 bg-gray-100 rounded flex-1" />
          <div className="h-5 bg-gray-100 rounded-full w-7" />
        </div>
        {/* Cards */}
        <div className="bg-gray-50/80 rounded-xl p-2 space-y-2 border-2 border-transparent">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    ))}
  </div>
);

export default KanbanSkeleton;
