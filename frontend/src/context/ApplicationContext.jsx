import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as svc from '../api/applicationService';

const ApplicationContext = createContext(null);

export const ApplicationProvider = ({ children }) => {
  // ── Paginated list — ApplicationsPage ────────────────────────────────────────
  const [applications,  setApplications]  = useState([]);
  const [pagination,    setPagination]    = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading,       setLoading]       = useState(false);

  // ── Full list — KanbanPage ───────────────────────────────────────────────────
  const [allApplications, setAllApplications] = useState([]);
  const [loadingAll,      setLoadingAll]      = useState(false);

  // ── Fetch paginated ──────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await svc.getApplications(params);
      setApplications(data.data.applications);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch ALL (Kanban) ───────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const { data } = await svc.getApplications({
        limit: 999, sortBy: 'createdAt', sortOrder: 'desc',
      });
      setAllApplications(data.data.applications);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoadingAll(false);
    }
  }, []);

  // ── Create ───────────────────────────────────────────────────────────────────
  const addApplication = useCallback(async (formData) => {
    const { data } = await svc.createApplication(formData);
    toast.success('Application added!');
    const created = data.data;
    setAllApplications((prev) => [created, ...prev]);
    return created;
  }, []);

  // ── Update ───────────────────────────────────────────────────────────────────
  const updateApplication = useCallback(async (id, formData) => {
    const { data } = await svc.updateApplication(id, formData);
    toast.success('Application updated!');
    const updated = data.data;
    setAllApplications((prev) => prev.map((a) => (a._id === id ? updated : a)));
    setApplications((prev)    => prev.map((a) => (a._id === id ? updated : a)));
    return updated;
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteApplication = useCallback(async (id) => {
    await svc.deleteApplication(id);
    toast.success('Application deleted');
    setAllApplications((prev) => prev.filter((a) => a._id !== id));
    setApplications((prev)    => prev.filter((a) => a._id !== id));
  }, []);

  // ── Optimistic status update (drag-and-drop) ─────────────────────────────────
  // Immediately reflects the new status in UI, makes API call in background,
  // and reverts with an error toast if the API fails.
  const updateStatus = useCallback(async (id, newStatus) => {
    const previous = allApplications.find((a) => a._id === id)?.status;
    if (previous === newStatus) return;

    const apply  = (prev) => prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a));
    const revert = (prev) => prev.map((a) => (a._id === id ? { ...a, status: previous  } : a));

    setAllApplications(apply);
    setApplications(apply);

    try {
      await svc.updateApplication(id, { status: newStatus });
    } catch {
      setAllApplications(revert);
      setApplications(revert);
      toast.error('Failed to update status — change reverted');
    }
  }, [allApplications]);

  return (
    <ApplicationContext.Provider
      value={{
        applications, pagination, loading, fetchApplications,
        allApplications, loadingAll, fetchAll,
        addApplication, updateApplication, deleteApplication, updateStatus,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplicationContext must be used inside <ApplicationProvider>');
  return ctx;
};

export default ApplicationContext;
