import { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getReportById, updateReportStatus } from '../services/api';
import type { Report } from '../services/api';
import { 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  FileText,
  CheckCircle,
  ClockIcon,
  XCircle
} from 'lucide-react';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReport = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      const response = await getReportById(id);
      setReport(response.data.report);
      setAdminNotes(response.data.report.adminNotes || '');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleStatusUpdate = async (newStatus: string, statusLabel: string) => {
    const confirmMessage = `Bạn có chắc chắn muốn chuyển trạng thái sang "${statusLabel}"?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setUpdating(true);
      await updateReportStatus(id!, newStatus, adminNotes);
      fetchReport(); // Refresh the report data
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

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
      case 'water_pollution': return 'Ô nhiễm nguồn nước';
      case 'chemical': return 'Hóa học';
      case 'biological': return 'Sinh học';
      case 'physical': return 'Vật lý';
      case 'thermal': return 'Nhiệt';
      case 'other': return 'Khác';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Đã gửi yêu cầu';
      case 'in_progress': return 'Đang xử lý';
      case 'resolved': return 'Đã xử lý xong';
      case 'rejected': return 'Từ chối';
      default: return status;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Đang tải chi tiết báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Lỗi Tải Báo Cáo
          </h2>
          <p className="text-gray-600">
            {error || 'Không tìm thấy báo cáo'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
                  {getStatusLabel(report.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mô tả
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vị trí
            </h3>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>
                {report.location.coordinates[1].toFixed(6)}, {report.location.coordinates[0].toFixed(6)}
              </span>
            </div>
          </div>

          {/* Images */}
          {report.images && report.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hình ảnh bằng chứng ({report.images.length} ảnh)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Evidence image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const newWindow = window.open(image, '_blank');
                        if (newWindow) {
                          newWindow.focus();
                        }
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Ảnh {index + 1}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <p className="text-white text-sm bg-black bg-opacity-75 px-3 py-1 rounded">
                        Nhấp để xem kích thước đầy đủ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hành động quản trị viên
            </h3>
            
            {/* Current Status Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trạng thái hiện tại</p>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span className="ml-2">{getStatusLabel(report.status)}</span>
                    </span>
                  </div>
                </div>
                {updating && (
                  <div className="flex items-center text-blue-600">
                    <Clock className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Đang cập nhật...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú quản trị viên
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Nhập ghi chú về báo cáo này (sẽ được lưu khi cập nhật trạng thái)..."
              />
              {report.adminNotes && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Ghi chú đã lưu trước đó:
                  </p>
                  <p className="text-sm text-gray-800">{report.adminNotes}</p>
                </div>
              )}
            </div>
            
            {/* Status Update Actions */}
            {(report.status === 'pending' || report.status === 'in_progress') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Thay đổi trạng thái báo cáo
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('in_progress', 'Đang xử lý')}
                      disabled={updating}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      Bắt đầu xử lý
                    </button>
                  )}
                  
                  {report.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate('resolved', 'Đã xử lý xong')}
                      disabled={updating}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Hoàn thành xử lý
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleStatusUpdate('rejected', 'Từ chối')}
                    disabled={updating}
                    className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Từ chối báo cáo
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 italic">
                  * Ghi chú sẽ được lưu cùng với thay đổi trạng thái
                </p>
              </div>
            )}
            
            {(report.status === 'resolved' || report.status === 'rejected') && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  Báo cáo đã được xử lý. Không thể thay đổi trạng thái.
                </p>
              </div>
            )}
          </div>

          {/* Report Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin Báo cáo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Loại phản ánh</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getIncidentTypeLabel(report.pollutionType)}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="ml-1">
                      {getStatusLabel(report.status)}
                    </span>
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Mức độ nghiêm trọng</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                    {report.severity}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">ID Báo cáo</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {report.id}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Người báo cáo</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{report.reporterId.username}</div>
                    <div className="text-gray-500">{report.reporterId.email}</div>
                  </div>
                </dd>
              </div>

              {report.adminId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Người xử lý</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{report.adminId.username}</div>
                      <div className="text-gray-500">{report.adminId.email}</div>
                    </div>
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(report.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Cập nhật lần cuối</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(report.updatedAt)}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
