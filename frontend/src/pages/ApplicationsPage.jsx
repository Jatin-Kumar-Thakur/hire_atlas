import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, Search, X, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApplicationContext } from '../context/ApplicationContext';
import AddApplicationModal from '../components/Applications/AddApplicationModal';
import ApplicationDetailModal from '../components/Applications/ApplicationDetailModal';
import StatusBadge from '../components/Applications/StatusBadge';
import SourceBadge from '../components/Applications/SourceBadge';
import ExportModal from '../components/Export/ExportModal';
import ImportModal from '../components/Export/ImportModal';
import { STATUSES, SOURCES, getAvatarColor } from '../utils/constants';

// ─── Sub-components ───────────────────────────────────────────────────────────

const CompanyAvatar = ({ name }) => (
  <div className={`w-8 h-8 rounded-full ${getAvatarColor(name)} flex items-center justify-center text-white text-xs font-bold shrink-0 select-none`}>
    {name.charAt(0).toUpperCase()}
  </div>
);

const TableSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        {Array.from({ length: 7 }).map((_, j) => (
          <td key={j} className="px-4 py-3.5">
            <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '160px' : j === 6 ? '60px' : '90px' }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const Pagination = ({ pagination, onPage, onLimit }) => {
  const { total, page, pages, limit } = pagination;
  if (!total) return null;

  const start   = (page - 1) * limit + 1;
  const end     = Math.min(page * limit, total);
  const btnBase = 'px-3 py-1.5 text-sm rounded-lg border transition-colors';

  const pageNums = useMemo(() => {
    const nums = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);
    return nums;
  }, [page, pages]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 px-1 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing {start}–{end} of {total} application{total !== 1 ? 's' : ''}
      </p>

      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}>
          <ChevronLeft size={15} />
        </button>
        {pageNums.map((n) => (
          <button key={n} onClick={() => onPage(n)}
            className={`${btnBase} ${n === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {n}
          </button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === pages}
          className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}>
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Per page:</span>
        <select value={limit} onChange={(e) => onLimit(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const ApplicationsPage = () => {
  const {
    applications, loading, pagination,
    fetchApplications,
    addApplication, updateApplication, deleteApplication,
  } = useApplicationContext();

  // Search (debounced separately)
  const [searchInput,     setSearchInput]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter/sort/page state
  const [filters, setFilters] = useState({
    status: '', source: '', startDate: '', endDate: '',
    sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10,
  });

  // Modal state
  const [showAdd,    setShowAdd]    = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // ── Debounce search ──────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setFilters((p) => ({ ...p, page: 1 }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Derive fetch params ──────────────────────────────────────────────────────
  const fetchParams = useMemo(() => ({
    ...filters,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }), [filters, debouncedSearch]);

  // ── Fetch whenever params change ─────────────────────────────────────────────
  useEffect(() => {
    fetchApplications(fetchParams);
  }, [fetchParams, fetchApplications]);

  const refetch = useCallback(
    () => fetchApplications(fetchParams),
    [fetchApplications, fetchParams],
  );

  const setFilter = (key, value) =>
    setFilters((p) => ({ ...p, [key]: value, ...(key !== 'page' && key !== 'limit' ? { page: 1 } : {}) }));

  const clearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setFilters((p) => ({ ...p, status: '', source: '', startDate: '', endDate: '', page: 1 }));
  };

  const hasFilters = searchInput || filters.status || filters.source || filters.startDate || filters.endDate;

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    await addApplication(data);
    setShowAdd(false);
    refetch();
  };

  const handleUpdate = async (data) => {
    await updateApplication(editingApp._id, data);
    setEditingApp(null);
    refetch();
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await deleteApplication(id);
      setDeletingId(null);
      if (viewingApp?._id === id) setViewingApp(null);
      refetch();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track every job you've applied to</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={15} /> Import
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Add Application
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 space-y-3 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search company or role…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>

          {/* Source filter */}
          <select value={filters.source} onChange={(e) => setFilter('source', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]">
            <option value="">All Sources</option>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Date range */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">From</span>
            <input type="date" value={filters.startDate} onChange={(e) => setFilter('startDate', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <span className="text-xs text-gray-500">To</span>
            <input type="date" value={filters.endDate} onChange={(e) => setFilter('endDate', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {['Company', 'Role', 'Source', 'Status', 'Applied', 'Follow-up', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <Search size={26} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-semibold mb-1">
                        {hasFilters ? 'No applications match your filters' : 'No applications yet'}
                      </p>
                      <p className="text-sm text-gray-400 mb-5">
                        {hasFilters ? 'Try adjusting or clearing the filters.' : 'Add your first job application to get started.'}
                      </p>
                      {!hasFilters && (
                        <button onClick={() => setShowAdd(true)}
                          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
                          <Plus size={16} /> Add Your First Application
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id}
                    onClick={() => setViewingApp(app)}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 cursor-pointer transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <CompanyAvatar name={app.company} />
                        <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{app.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-700 truncate max-w-[130px] block">{app.role}</span>
                    </td>
                    <td className="px-4 py-3.5"><SourceBadge source={app.source} /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                      {app.appliedDate ? format(new Date(app.appliedDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                      {app.followUpDate ? (
                        <span className="text-gray-500">{format(new Date(app.followUpDate), 'dd MMM yyyy')}</span>
                      ) : (
                        <span className="text-indigo-400 text-xs">Set reminder</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="View" onClick={() => setViewingApp(app)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Eye size={15} />
                        </button>
                        <button title="Edit" onClick={() => setEditingApp(app)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition">
                          <Pencil size={15} />
                        </button>
                        <button title="Delete" onClick={() => setDeletingId(app._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && applications.length > 0 && (
          <div className="px-4">
            <Pagination
              pagination={pagination}
              onPage={(p) => setFilter('page', p)}
              onLimit={(l) => setFilter('limit', l)}
            />
          </div>
        )}
      </div>

      {/* ── Delete confirmation ───────────────────────────────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setDeletingId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Application?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition disabled:opacity-60">
                Cancel
              </button>
              <button onClick={() => handleDelete(deletingId)} disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2">
                {isDeleting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
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
        initialFilters={fetchParams}
      />

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImported={refetch}
      />
    </div>
  );
};

export default ApplicationsPage;
