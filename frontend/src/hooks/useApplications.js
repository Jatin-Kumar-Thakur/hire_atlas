import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as svc from '../api/applicationService';

/**
 * Manages application list state and exposes CRUD actions.
 * The page component decides WHEN to fetch by calling fetchApplications(params).
 */
const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [pagination, setPagination]     = useState({
    total: 0, page: 1, pages: 1, limit: 10,
  });

  const fetchApplications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await svc.getApplications(params);
      setApplications(data.data.applications);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Creates an application and shows a toast.
   * The caller is responsible for re-fetching after this resolves.
   * @param {Object} formData
   * @returns {Object} Created application
   */
  const createApplication = useCallback(async (formData) => {
    const { data } = await svc.createApplication(formData);
    toast.success('Application added!');
    return data.data;
  }, []);

  /**
   * Updates an application and shows a toast.
   * @param {string} id
   * @param {Object} formData
   * @returns {Object} Updated application
   */
  const updateApplication = useCallback(async (id, formData) => {
    const { data } = await svc.updateApplication(id, formData);
    toast.success('Application updated!');
    return data.data;
  }, []);

  /**
   * Deletes an application and shows a toast.
   * @param {string} id
   */
  const deleteApplication = useCallback(async (id) => {
    await svc.deleteApplication(id);
    toast.success('Application deleted');
  }, []);

  return {
    applications,
    loading,
    pagination,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  };
};

export default useApplications;
