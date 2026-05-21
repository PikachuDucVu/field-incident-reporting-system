import { useState, useEffect } from 'react';
import { getReports } from '../services/api';
import type { Report } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  MapPin
} from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  highSeverity: number;
  criticalSeverity: number;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highSeverity: 0,
    criticalSeverity: 0
  });
  const [loading, setLoading] = useState(true);
  const { latestNotification } = useNotifications();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getReports({ limit: 100 });
      const reportsData = response.data.reports;

      setReports(reportsData);

      // Calculate stats
      const newStats = reportsData.reduce((acc: Stats, report: Report) => {
        acc.total++;

        switch (report.status) {
          case 'pending':
            acc.pending++;
            break;
          case 'in_progress':
            acc.inProgress++;
            break;
          case 'resolved':
            acc.resolved++;
            break;
        }

        if (report.severity === 'high') acc.highSeverity++;
        if (report.severity === 'critical') acc.criticalSeverity++;

        return acc;
      }, {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        highSeverity: 0,
        criticalSeverity: 0
      });

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latestNotification?.type === 'new_report') {
      fetchDashboardData();
    }
  }, [latestNotification]);

  const statCards = [
    {
      name: 'Tổng số báo cáo',
      value: stats.total,
      icon: FileText,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-100'
    },
    {
      name: 'Đang chờ',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Đang xử lý',
      value: stats.inProgress,
      icon: BarChart3,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Đã giải quyết',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    }
  ];

  const severityCards = [
    {
      name: 'Mức độ Cao',
      value: stats.highSeverity,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Mức độ Nghiêm trọng',
      value: stats.criticalSeverity,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-100'
    }
  ];

  const recentReports = reports.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600">Giám sát phản ánh hiện trường và trạng thái xử lý</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`w-6 h-6 ${stat.color} text-white`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Severity Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {severityCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center">
                <div className={`${card.bgColor} rounded-lg p-3`}>
                  <Icon className={`w-6 h-6 ${card.color} text-white`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Báo cáo gần đây nhất</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có báo cáo nào được tạo</p>
            </div>
          ) : (
            recentReports.map((report) => (
              <div key={report.id} className="px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {report.reporterId.username} • 
                      <span className="ml-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                        {report.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentReports.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t">
            <a
              href="/admin/reports"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem tất cả các báo cáo →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
