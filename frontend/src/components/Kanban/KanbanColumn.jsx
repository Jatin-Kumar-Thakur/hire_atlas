import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ status, applications, dotColor, onView, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
        <h3 className="text-sm font-semibold text-gray-700 truncate flex-1">{status}</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 transition-colors border-2 overflow-y-auto ${
          isOver
            ? 'bg-indigo-50/70 border-indigo-300 border-dashed'
            : 'bg-gray-50/80 border-transparent'
        }`}
        style={{ minHeight: '8rem', maxHeight: 'calc(100vh - 250px)' }}
      >
        {applications.length === 0 ? (
          <div
            className={`h-24 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
              isOver ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <p className="text-xs text-gray-300 select-none">Drop here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <KanbanCard
                key={app._id}
                application={app}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
