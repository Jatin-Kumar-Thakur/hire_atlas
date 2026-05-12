import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
} from '../../api/applicationService';
import { INTERVIEW_TYPES, INTERVIEW_STATUSES } from '../../utils/constants';

const STATUS_COLORS = {
  Pending:  'bg-yellow-100 text-yellow-700',
  Cleared:  'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = { type: 'Technical', date: '', status: 'Pending', notes: '' };

// ─── Inline form (add or edit) ────────────────────────────────────────────────
const RoundForm = ({ form, setForm, onSave, onCancel, saving, isEdit }) => {
  const cls =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
        {isEdit ? 'Edit Round' : 'New Round'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Round Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            className={cls}
          >
            {INTERVIEW_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            className={cls}
          >
            {INTERVIEW_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Date – full width */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Date &amp; Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className={cls}
          />
        </div>

        {/* Notes – full width */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={2}
            maxLength={1000}
            placeholder="e.g. Solved 3 medium DP problems, discussed OOPS..."
            className={`${cls} resize-none`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60 flex items-center gap-1.5 transition"
        >
          {saving && (
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Round'}
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const InterviewRounds = ({ applicationId, initialRounds = [], onUpdate }) => {
  const [rounds,        setRounds]        = useState(initialRounds);
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [confirmDelId,  setConfirmDelId]  = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [expandedIds,   setExpandedIds]   = useState(new Set());

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowAddForm(true);
  };

  const openEdit = (round) => {
    setShowAddForm(false);
    setConfirmDelId(null);
    setEditingId(round._id);
    setForm({
      type:   round.type,
      date:   round.date ? new Date(round.date).toISOString().slice(0, 16) : '',
      status: round.status,
      notes:  round.notes || '',
    });
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.type || !form.date) {
      toast.error('Round type and date are required');
      return;
    }
    setSaving(true);
    try {
      let res;
      if (editingId) {
        res = await updateInterviewRound(applicationId, editingId, form);
      } else {
        res = await addInterviewRound(applicationId, form);
      }
      const updatedApp = res.data.data;
      setRounds(updatedApp.interviewRounds);
      onUpdate(updatedApp);
      cancelForm();
      toast.success(editingId ? 'Round updated' : 'Round added');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save round');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roundId) => {
    setDeleting(true);
    try {
      const res = await deleteInterviewRound(applicationId, roundId);
      const updatedApp = res.data.data;
      setRounds(updatedApp.interviewRounds);
      onUpdate(updatedApp);
      setConfirmDelId(null);
      toast.success('Round deleted');
    } catch {
      toast.error('Failed to delete round');
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpand = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Interview Rounds{rounds.length > 0 ? ` (${rounds.length})` : ''}
        </h3>
        {!showAddForm && !editingId && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 transition"
          >
            <Plus size={12} /> Add Round
          </button>
        )}
      </div>

      {/* Empty state */}
      {rounds.length === 0 && !showAddForm && (
        <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-xs text-gray-400">No interview rounds yet — add the first one!</p>
        </div>
      )}

      {/* Timeline */}
      {rounds.length > 0 && (
        <div className="space-y-2">
          {rounds.map((round) =>
            editingId === round._id ? (
              <RoundForm
                key={round._id}
                form={form}
                setForm={setForm}
                onSave={handleSave}
                onCancel={cancelForm}
                saving={saving}
                isEdit
              />
            ) : (
              <div
                key={round._id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group"
              >
                {/* Round number */}
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0 mt-0.5">
                  {round.roundNumber}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{round.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[round.status]}`}>
                      {round.status}
                    </span>
                    {round.date && (
                      <span className="text-xs text-gray-400">
                        {format(new Date(round.date), 'dd MMM yyyy, h:mm a')}
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {round.notes && (
                    <div className="mt-1.5">
                      <p className={`text-xs text-gray-500 leading-relaxed ${expandedIds.has(round._id) ? '' : 'line-clamp-2'}`}>
                        {round.notes}
                      </p>
                      {round.notes.length > 100 && (
                        <button
                          onClick={() => toggleExpand(round._id)}
                          className="text-xs text-indigo-400 hover:text-indigo-600 mt-0.5"
                        >
                          {expandedIds.has(round._id) ? 'Show less ↑' : 'Show more ↓'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inline delete confirmation */}
                  {confirmDelId === round._id && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-red-500 font-medium">Delete this round?</span>
                      <button
                        onClick={() => handleDelete(round._id)}
                        disabled={deleting}
                        className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 disabled:opacity-60"
                      >
                        {deleting ? '…' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmDelId(null)}
                        className="text-xs border border-gray-300 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-50"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>

                {/* Action icons — visible on hover */}
                {confirmDelId !== round._id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => openEdit(round)}
                      className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit round"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelId(round._id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete round"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="mt-2">
          <RoundForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={cancelForm}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
};

export default InterviewRounds;
