import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { STATUSES, SOURCES } from '../../utils/constants';

const todayISO = () => new Date().toISOString().split('T')[0];

const buildForm = (data) => ({
  company:      data?.company      ?? '',
  role:         data?.role         ?? '',
  source:       data?.source       ?? 'Other',
  status:       data?.status       ?? 'Applied',
  jobUrl:       data?.jobUrl       ?? '',
  location:     data?.location     ?? '',
  salary:       data?.salary       ?? '',
  appliedDate:  data?.appliedDate  ? new Date(data.appliedDate).toISOString().split('T')[0] : todayISO(),
  followUpDate: data?.followUpDate ? new Date(data.followUpDate).toISOString().split('T')[0] : '',
  notes:        data?.notes        ?? '',
});

const FIELD = (err, extra = '') =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300'
  } ${extra}`;

const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-gray-700 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

/**
 * Modal form for creating and editing job applications.
 * @prop {boolean}       isOpen       - controls visibility
 * @prop {Function}      onClose      - called when modal should close
 * @prop {Function}      onSubmit     - async fn(formData) called on valid submit
 * @prop {Object|null}   initialData  - pre-populate form when editing
 */
const AddApplicationModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [form,      setForm]      = useState(buildForm(null));
  const [errors,    setErrors]    = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Re-populate whenever the modal opens or switches between add/edit
  useEffect(() => {
    if (isOpen) {
      setForm(buildForm(initialData));
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = 'Company name is required';
    if (!form.role.trim())    errs.role    = 'Job role is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      await onSubmit({
        ...form,
        company:     form.company.trim(),
        role:        form.role.trim(),
        jobUrl:      form.jobUrl.trim()    || null,
        location:    form.location.trim()  || null,
        salary:      form.salary.trim()    || null,
        followUpDate:form.followUpDate     || null,
      });
    } catch {
      // Parent surfaces the error via toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Edit Application' : 'Add New Application'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Company */}
            <div>
              <Label required>Company Name</Label>
              <input name="company" value={form.company} onChange={change} placeholder="e.g. Google" className={FIELD(errors.company)} />
              <FieldError msg={errors.company} />
            </div>

            {/* Role */}
            <div>
              <Label required>Job Role</Label>
              <input name="role" value={form.role} onChange={change} placeholder="e.g. Software Engineer" className={FIELD(errors.role)} />
              <FieldError msg={errors.role} />
            </div>

            {/* Source */}
            <div>
              <Label>Application Source</Label>
              <select name="source" value={form.source} onChange={change} className={FIELD()}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <select name="status" value={form.status} onChange={change} className={FIELD()}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Job URL — full width */}
            <div className="sm:col-span-2">
              <Label>Job URL</Label>
              <input name="jobUrl" type="text" value={form.jobUrl} onChange={change} placeholder="https://..." className={FIELD()} />
            </div>

            {/* Location */}
            <div>
              <Label>Location</Label>
              <input name="location" value={form.location} onChange={change} placeholder="e.g. Bangalore, Remote" className={FIELD()} />
            </div>

            {/* Salary */}
            <div>
              <Label>Salary Range</Label>
              <input name="salary" value={form.salary} onChange={change} placeholder="e.g. 8–12 LPA" className={FIELD()} />
            </div>

            {/* Applied Date */}
            <div>
              <Label>Applied Date</Label>
              <input type="date" name="appliedDate" value={form.appliedDate} onChange={change} className={FIELD()} />
            </div>

            {/* Follow-up Date */}
            <div>
              <Label>Follow-up Date <span className="text-gray-400 font-normal">(optional)</span></Label>
              <input type="date" name="followUpDate" value={form.followUpDate} onChange={change} className={FIELD()} />
            </div>

            {/* Notes — full width */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-700">Notes</span>
                <span className={`text-xs ${form.notes.length > 1800 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.notes.length}/2000
                </span>
              </div>
              <textarea
                name="notes"
                value={form.notes}
                onChange={change}
                rows={4}
                maxLength={2000}
                placeholder="Interview details, contacts, follow-up reminders…"
                className={FIELD(false, 'resize-none')}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition flex items-center gap-2"
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {isLoading ? 'Saving…' : initialData ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddApplicationModal;
