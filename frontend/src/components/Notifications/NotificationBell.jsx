import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Calendar, Info, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';

const TYPE_ICONS = {
  follow_up_reminder: Clock,
  interview_reminder: Calendar,
  status_update:      Info,
  general:            Bell,
};

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const Icon = TYPE_ICONS[notification.type] ?? Bell;
  const company = notification.applicationId?.company ?? '';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition group ${
        !notification.isRead ? 'bg-indigo-50/30' : ''
      }`}
    >
      {/* Unread indicator */}
      <div
        className={`w-2 h-2 rounded-full mt-2 shrink-0 transition ${
          notification.isRead ? 'bg-transparent' : 'bg-indigo-500'
        }`}
      />

      {/* Icon */}
      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${notification.isRead ? 'bg-gray-100' : 'bg-indigo-100'}`}>
        <Icon size={13} className={notification.isRead ? 'text-gray-400' : 'text-indigo-600'} />
      </div>

      {/* Content — click to mark as read */}
      <button
        onClick={() => !notification.isRead && onRead(notification._id)}
        className="flex-1 min-w-0 text-left"
      >
        <p className={`text-sm leading-snug ${notification.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
          {notification.title}
        </p>
        {company && (
          <p className="text-xs text-indigo-500 truncate">{company}</p>
        )}
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(notification._id)}
        className="p-1 text-gray-300 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition shrink-0"
        title="Remove"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">You're all caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
