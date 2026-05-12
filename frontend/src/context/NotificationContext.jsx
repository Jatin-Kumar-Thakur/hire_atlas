import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as svc from '../api/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await svc.getNotifications();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {
      // silent — user may not be authenticated yet
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling after auth resolves; clear interval on logout
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [isAuthenticated, authLoading, fetchNotifications]);

  // Optimistic mark-as-read for a single notification
  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await svc.markAsRead(id);
    } catch {
      fetchNotifications(); // revert on failure
    }
  }, [fetchNotifications]);

  // Optimistic mark-all-as-read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await svc.markAllAsRead();
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await svc.deleteNotification(id);
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
};

export default NotificationContext;
