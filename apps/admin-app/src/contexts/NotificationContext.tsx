/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { createSocket, type RealtimeNotification } from '../services/socket';

type NotificationItem = RealtimeNotification & {
  id: string;
  read: boolean;
  receivedAt: string;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  unreadCount: number;
  latestNotification: NotificationItem | null;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  openNotification: (notification: NotificationItem) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}

type NotificationProviderProps = {
  children: ReactNode;
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);
  const [visibleToast, setVisibleToast] = useState<NotificationItem | null>(null);
  const realtimeEnabled = Boolean(token && user?.role === 'admin');

  const addNotification = useCallback((notification: RealtimeNotification) => {
    const item: NotificationItem = {
      ...notification,
      id: `${notification.type}-${notification.reportId}-${Date.now()}`,
      read: false,
      receivedAt: new Date().toISOString()
    };

    setNotifications((current) => [item, ...current].slice(0, 20));
    setLatestNotification(item);
    setVisibleToast(item);
  }, []);

  useEffect(() => {
    if (realtimeEnabled) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotifications([]);
      setLatestNotification(null);
      setVisibleToast(null);
    });

    return () => window.clearTimeout(timer);
  }, [realtimeEnabled]);

  useEffect(() => {
    if (!realtimeEnabled || !token) {
      return;
    }

    const socket = createSocket(token);

    socket.on('notification:new-report', addNotification);
    socket.on('connect_error', (error) => {
      console.error('Socket connection failed:', error.message);
    });

    return () => {
      socket.off('notification:new-report', addNotification);
      socket.disconnect();
    };
  }, [addNotification, realtimeEnabled, token]);

  useEffect(() => {
    if (!visibleToast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVisibleToast(null);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [visibleToast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) => current.map((notification) => (
      notification.id === id ? { ...notification, read: true } : notification
    )));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({
      ...notification,
      read: true
    })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLatestNotification(null);
    setVisibleToast(null);
  }, []);

  const openNotification = useCallback((notification: NotificationItem) => {
    markAsRead(notification.id);
    setVisibleToast(null);
    navigate(`/admin/reports/${notification.reportId}`);
  }, [markAsRead, navigate]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    latestNotification,
    markAllRead,
    markAsRead,
    clearNotifications,
    openNotification
  }), [
    clearNotifications,
    latestNotification,
    markAllRead,
    markAsRead,
    notifications,
    openNotification,
    unreadCount
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {visibleToast && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border border-blue-100 bg-white shadow-lg">
          <div className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Bell className="h-5 w-5" />
            </div>
            <button
              type="button"
              onClick={() => openNotification(visibleToast)}
              className="flex-1 text-left"
            >
              <p className="font-semibold text-gray-900">{visibleToast.title}</p>
              <p className="mt-1 text-sm text-gray-600">{visibleToast.message}</p>
              <p className="mt-2 text-xs text-blue-600">Nhấp để xem chi tiết</p>
            </button>
            <button
              type="button"
              onClick={() => setVisibleToast(null)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Đóng thông báo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
