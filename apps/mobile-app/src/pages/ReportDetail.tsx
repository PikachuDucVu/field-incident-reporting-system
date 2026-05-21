import { useCallback, useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getReportById } from '../services/api';
import type { Report } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  FileText, 
  ArrowLeft,
  CheckCircle,
  ClockIcon,
  XCircle
} from 'lucide-react';

export default function ReportDetail() {
  const location = useLocation();
  const params = useParams();
  console.log('All params:', params);
  console.log('Location pathname:', location.pathname);
  
  // Try multiple ways to get the ID
  const id = params.id || location.pathname.split('/reports/')[1];
  console.log('ReportDetail - id:', id);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { latestNotification } = useNotifications();

  const fetchReport = useCallback(async () => {
    if (!id || id === 'undefined') {
      return;
    }

    try {
      setLoading(true);
      const response = await getReportById(id);
      setReport(response.data.report);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchReport();
    } else {
      console.error('No valid ID found');
      setError('ID báo cáo không hợp lệ');
      setLoading(false);
    }
  }, [fetchReport, id]);

  useEffect(() => {
    if (latestNotification?.type === 'report_status_updated' && latestNotification.reportId === id) {
      fetchReport();
    }
  }, [fetchReport, id, latestNotification]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIncidentTypeLabel = (type: string) => {
    switch (type) {
      case 'traffic': return 'Giao thông';
      case 'infrastructure': return 'Hạ tầng hư hỏng';
      case 'road': return 'Đường xá';
      case 'industrial_waste': return 'Rác thải công nghiệp';
      case 'environment': return 'Môi trường';
      case 'chemical': return 'Hóa học';
      case 'biological': return 'Sinh học';
      case 'physical': return 'Vật lý';
      case 'thermal': return 'Nhiệt';
      case 'other': return 'Khác';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openMap = () => {
    if (report) {
      const { latitude, longitude } = {
        latitude: report.location.coordinates[1],
        longitude: report.location.coordinates[0]
      };
      window.open(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        '_blank'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Đang tải chi tiết báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Lỗi Tải Báo Cáo
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'Không tìm thấy báo cáo'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Thử Lại
            </button>
            <Link
              to="/reports"
              className="text-blue-600 hover:text-blue-800"
            >
              Quay lại Danh sách Báo cáo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">
              Chi Tiết Báo Cáo
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Report Header */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {report.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {report.reporterId.username}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(report.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                  {report.severity.toUpperCase()}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  <span className="ml-1">
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mô Tả
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vị Trí
              </h3>
              <button
                onClick={openMap}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <MapPin className="w-5 h-5 mr-2" />
                <span>
                  {report.location.coordinates[1].toFixed(6)}, {report.location.coordinates[0].toFixed(6)}
                </span>
              </button>
            </div>

            {/* Images */}
            {report.images && report.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hình ảnh đính kèm ({report.images.length} ảnh)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Hình ảnh ${index + 1} của phản ánh hiện trường`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // Open image in new window
                          const newWindow = window.open(image, '_blank');
                          if (newWindow) {
                            newWindow.focus();
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <p className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                          Nhấp để xem ảnh lớn
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông Tin Báo Cáo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loại phản ánh</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {getIncidentTypeLabel(report.pollutionType)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Trạng Thái</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1">
                        {report.status.replace('_', ' ')}
                      </span>
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Mức Độ Nghiêm Trọng</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">ID Báo Cáo</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {report.id}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Người Báo Cáo</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{report.reporterId.username}</div>
                      <div className="text-gray-500">{report.reporterId.email}</div>
                    </div>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Cập Nhật Lần Cuối</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(report.updatedAt)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          <Link
            to="/reports"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại Danh sách Báo cáo
          </Link>
          <Link
            to="/reports/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Tạo phản ánh mới
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy báo cáo
            </h2>
            <p className="text-gray-600 mb-4">
              ID báo cáo không hợp lệ hoặc báo cáo không tồn tại
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">
                URL hiện tại: <span className="font-mono">{window.location.pathname}</span>
              </p>
              <p className="text-xs text-gray-400 font-mono">
                Debug: params={JSON.stringify(params)}, id={id}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/reports')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
