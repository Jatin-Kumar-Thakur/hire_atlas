import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportApplications, getApplications } from '../../api/applicationService';
import { downloadCSVTemplate } from '../../utils/csvTemplate';
import { STATUSES, SOURCES } from '../../utils/constants';

const ExportModal = ({ isOpen, onClose, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    status:    initialFilters.status    || '',
    source:    initialFilters.source    || '',
    startDate: initialFilters.startDate || '',
    endDate:   initialFilters.endDate   || '',
  });
  const [previewCount,   setPreviewCount]   = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exporting,      setExporting]      = useState(false);

  // Live preview count — debounced
  useEffect(() => {
    if (!isOpen) return;
    setPreviewLoading(true);
    const t = setTimeout(async () => {
      try {
        const params = { limit: 1, page: 1 };
        if (filters.status)    params.status    = filters.status;
        if (filters.source)    params.source    = filters.source;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate)   params.endDate   = filters.endDate;
        const { data } = await getApplications(params);
        setPreviewCount(data.data.pagination.total);
      } catch {
        setPreviewCount(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [filters, isOpen]);

  const setFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const handleExport = async () => {
    if (previewCount === 0) { toast.error('No applications match the selected filters'); return; }
    setExporting(true);
    try {
      await exportApplications(filters);
      toast.success('CSV downloaded successfully!');
      onClose();
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Download size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Export Applications</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-gray-500">
            Optionally narrow the export with filters below.
          </p>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Source filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilter('source', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sources</option>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilter('startDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilter('endDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Preview count */}
          <div className="bg-indigo-50 rounded-xl px-4 py-3 text-sm">
            {previewLoading ? (
              <span className="text-indigo-400">Calculating…</span>
            ) : previewCount !== null ? (
              <span className="text-indigo-700 font-medium">
                {previewCount} application{previewCount !== 1 ? 's' : ''} will be exported
              </span>
            ) : (
              <span className="text-indigo-400">Ready to export</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 gap-3">
          <button
            onClick={downloadCSVTemplate}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            <FileText size={14} />
            Download Template
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || previewCount === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition"
            >
              {exporting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {exporting ? 'Exporting…' : 'Download CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
