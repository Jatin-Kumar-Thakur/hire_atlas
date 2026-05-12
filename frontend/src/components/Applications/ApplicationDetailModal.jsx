import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Pencil, Trash2, Calendar, MapPin, DollarSign, Globe, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import SourceBadge from './SourceBadge';
import InterviewRounds from './InterviewRounds';
import { getAvatarColor, getFollowUpStatus } from '../../utils/constants';

const fmt = (date) => date ? format(new Date(date), 'dd MMM yyyy') : '—';

const DetailRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  </div>
);

const FollowUpBadge = ({ date }) => {
  const status = getFollowUpStatus(date);
  if (status === null) {
    return <span className="text-indigo-600 text-xs cursor-pointer hover:underline">Set reminder</span>;
  }
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span>{fmt(date)}</span>
      {status === 'overdue' && (
        <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">Overdue!</span>
      )}
      {status === 'today' && (
        <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full font-semibold">Follow up today!</span>
      )}
      {typeof status === 'number' && status > 0 && (
        <span className="text-xs text-gray-400">in {status} day{status !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

const ApplicationDetailModal = ({ isOpen, onClose, application, onEdit, onDelete }) => {
  const [localApp,       setLocalApp]       = useState(application);
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [isDeleting,     setIsDeleting]     = useState(false);

  // Sync local copy whenever the prop changes (e.g. parent re-opens with fresh data)
  useEffect(() => {
    if (application) {
      setLocalApp(application);
      setConfirmDelete(false);
    }
  }, [application]);

  if (!isOpen || !localApp) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(localApp._id);
      onClose();
    } catch {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const avatarColor = getAvatarColor(localApp.company);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xl font-bold shrink-0`}>
            {localApp.company.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{localApp.company}</h2>
            <p className="text-sm text-gray-500 truncate">{localApp.role}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={localApp.status} />
              <SourceBadge source={localApp.source} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailRow icon={Calendar} label="Applied Date">
              {fmt(localApp.appliedDate)}
            </DetailRow>

            <DetailRow icon={Clock} label="Follow-up Date">
              <FollowUpBadge date={localApp.followUpDate} />
            </DetailRow>

            {localApp.location && (
              <DetailRow icon={MapPin} label="Location">
                {localApp.location}
              </DetailRow>
            )}

            {localApp.salary && (
              <DetailRow icon={DollarSign} label="Salary Range">
                {localApp.salary}
              </DetailRow>
            )}

            {localApp.jobUrl && (
              <DetailRow icon={Globe} label="Job URL">
                <a
                  href={localApp.jobUrl.startsWith('http') ? localApp.jobUrl : `https://${localApp.jobUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1 text-sm"
                >
                  Open listing <ExternalLink size={12} />
                </a>
              </DetailRow>
            )}

            <DetailRow icon={AlertCircle} label="Reminder sent">
              {localApp.reminderSent ? 'Yes' : 'No'}
            </DetailRow>
          </div>

          {/* Notes */}
          {localApp.notes && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                {localApp.notes}
              </p>
            </div>
          )}

          {/* Interview Rounds — interactive */}
          <InterviewRounds
            applicationId={localApp._id}
            initialRounds={localApp.interviewRounds ?? []}
            onUpdate={(updatedApp) => setLocalApp(updatedApp)}
          />

          {/* Meta */}
          <div className="text-xs text-gray-400 flex gap-4 pt-2 border-t border-gray-100">
            <span>Created: {fmt(localApp.createdAt)}</span>
            <span>Updated: {fmt(localApp.updatedAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-3 w-full">
              <p className="text-sm text-red-600 font-medium flex-1">Are you sure? This cannot be undone.</p>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg flex items-center gap-1.5"
              >
                {isDeleting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={15} /> Delete
              </button>
              <button
                onClick={() => { onClose(); onEdit(localApp); }}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                <Pencil size={15} /> Edit Application
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
