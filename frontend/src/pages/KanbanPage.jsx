import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Search, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApplicationContext } from '../context/ApplicationContext';
import { SOURCES } from '../utils/constants';
import KanbanBoard, { CardPreview } from '../components/Kanban/KanbanBoard';
import KanbanSkeleton from '../components/Kanban/KanbanSkeleton';
import AddApplicationModal from '../components/Applications/AddApplicationModal';
import ApplicationDetailModal from '../components/Applications/ApplicationDetailModal';

const KanbanPage = () => {
  const {
    allApplications,
    loadingAll,
    fetchAll,
    addApplication,
    updateApplication,
    deleteApplication,
    updateStatus,
  } = useApplicationContext();

  // ── Client-side filters ──────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [showAdd,     setShowAdd]     = useState(false);
  const [editingApp,  setEditingApp]  = useState(null);
  const [viewingApp,  setViewingApp]  = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [isDeleting,  setIsDeleting]  = useState(false);

  // ── DnD active card id ───────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Pointer sensor: require 8px movement before drag starts
  // — prevents accidental drags when clicking buttons
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  // ── Client-side filtering ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let apps = allApplications;
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(
        (a) => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q),
      );
    }
    if (source) apps = apps.filter((a) => a.source === source);
    return apps;
  }, [allApplications, search, source]);

  const hasFilters  = search || source;
  const activeApp   = activeId ? allApplications.find((a) => a._id === activeId) : null;

  // ── DnD handlers ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback(({ active }) => {
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null);
      if (!over) return;
      const card = allApplications.find((a) => a._id === active.id);
      if (!card || card.status === over.id) return;
      updateStatus(active.id, over.id); // optimistic — instant UI update
    },
    [allApplications, updateStatus],
  );

  const handleDragCancel = useCallback(() => setActiveId(null), []);

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    try {
      await addApplication(formData);
      setShowAdd(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add application');
      throw err;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateApplication(editingApp._id, formData);
      setEditingApp(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update application');
      throw err;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteApplication(deletingApp._id);
      if (viewingApp?._id === deletingApp._id) setViewingApp(null);
      setDeletingApp(null);
    } catch {
      toast.error('Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFromDetail = async (id) => {
    await deleteApplication(id);
    setViewingApp(null);
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loadingAll
              ? 'Loading…'
              : hasFilters
              ? `${filtered.length} of ${allApplications.length} application${allApplications.length !== 1 ? 's' : ''}`
              : `${allApplications.length} application${allApplications.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-5 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
        >
          <option value="">All Sources</option>
          {SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setSource(''); }}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Board */}
      {loadingAll ? (
        <KanbanSkeleton />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <KanbanBoard
            applications={filtered}
            onView={setViewingApp}
            onEdit={setEditingApp}
            onDelete={setDeletingApp}
          />

          {/* Floating drag preview */}
          <DragOverlay dropAnimation={null}>
            {activeApp ? <CardPreview application={activeApp} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Delete confirmation */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setDeletingApp(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Delete Application?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingApp(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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
        onDelete={handleDeleteFromDetail}
      />
    </div>
  );
};

export default KanbanPage;
