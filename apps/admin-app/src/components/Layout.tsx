import { useState, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { LogOut, Users, BarChart, Map as MapIcon, FileText, Bell } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export default function Layout({ children, currentPage }: LayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, clearNotifications, openNotification } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { name: 'Tổng quan', href: '/admin', icon: BarChart },
    { name: 'Báo cáo', href: '/admin/reports', icon: Users },
    { name: 'Bản đồ', href: '/admin/map', icon: MapIcon },
  ];

  const formatNotificationTime = (dateString: string) => new Date(dateString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển</h1>
              <p className="text-xs text-gray-500">Hệ thống phản ánh hiện trường</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.href;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentPage?.includes('/admin/reports') && 'Quản lý Báo cáo'}
                {currentPage === '/admin' && 'Tổng quan'}
                {currentPage?.includes('/admin/map') && 'Xem Bản đồ'}
              </h2>
              <p className="text-sm text-gray-500">
                Quản lý phản ánh hiện trường và trạng thái xử lý
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  markAllRead();
                }}
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Thông báo"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-900">Thông báo</p>
                      <p className="text-xs text-gray-500">Phản ánh hiện trường mới</p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Chưa có thông báo mới
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 8).map((notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          onClick={() => {
                            openNotification(notification);
                            setNotificationsOpen(false);
                          }}
                          className="block w-full border-b px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <p className="mt-2 text-xs text-gray-400">{formatNotificationTime(notification.receivedAt)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
