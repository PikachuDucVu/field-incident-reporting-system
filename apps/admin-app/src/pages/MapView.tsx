import { useState, useEffect, useRef, useCallback } from 'react';
import { getReports } from '../services/api';
import type { Report } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import { AlertTriangle, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import '../styles/map.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create marker icon factory with icon storage
const iconFactory: { icons: Record<string, string> } = {
  icons: {
    low: '#10b981',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444'
  }
};

// Create marker icon function
const createCustomIcon = (severity: string) => {
  const color = iconFactory.icons[severity] || '#6b7280';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: pointer; transform: translate(-50%, -50%); position: relative;" class="marker-pulse"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Get status label in Vietnamese
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Đã gửi yêu cầu';
    case 'in_progress': return 'Đang xử lý';
    case 'resolved': return 'Đã xử lý xong';
    case 'rejected': return 'Từ chối';
    default: return status;
  }
};

function MapView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { latestNotification } = useNotifications();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getReports();
      const reportsData = response.data.reports || [];
      setReports(reportsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Không thể tải dữ liệu báo cáo');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (latestNotification?.type === 'new_report') {
      fetchReports();
    }
  }, [fetchReports, latestNotification]);

  useEffect(() => {
    if (!mapRef.current || !mapInstanceRef.current || !reports || reports.length === 0) {
      return;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    const bounds: L.LatLngTuple[] = [];

    // Filter reports by status
    const filteredReports = statusFilter === 'all' 
      ? reports 
      : reports.filter(report => report.status === statusFilter);

    // Add new markers
    filteredReports.forEach((report) => {
      const lat = report.location?.coordinates?.[1];
      const lng = report.location?.coordinates?.[0];
      
      if (lat && lng) {
        const latLng: L.LatLngTuple = [lat, lng];
        
        const marker = L.marker(latLng, {
          icon: createCustomIcon(report.severity)
        }).addTo(map);

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${report.title || 'Không có tiêu đề'}</h3>
            <p class="text-sm text-gray-600">${report.description || ''}</p>
            <p class="text-sm"><strong>Mức độ:</strong> ${report.severity}</p>
            <p class="text-sm"><strong>Trạng thái:</strong> ${getStatusLabel(report.status)}</p>
            <a href="/admin/reports/${report.id}" class="text-blue-600 hover:underline text-sm">Xem chi tiết</a>
          </div>
        `);

        markersRef.current.push(marker);
        bounds.push(latLng);
      }
    });

    // Center map on markers
    if (bounds.length > 0) {
      const firstBound = bounds[0];

      if (bounds.length === 1 && firstBound) {
        map.setView(firstBound, 13);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [reports, mapReady, statusFilter]);

  useEffect(() => {
    // Don't initialize if still loading or map already exists
    if (loading || mapInstanceRef.current) {
      return;
    }
    
    // Wait for the ref to be available
    const initMap = () => {
      if (!mapRef.current) {
        setTimeout(initMap, 50);
        return;
      }
      
      // Clear any existing map instance
      const existingContainer = mapRef.current.querySelector('.leaflet-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      try {
        const map = L.map(mapRef.current, {
          center: [10.8231, 106.6297],
          zoom: 11,
          zoomControl: true,
          attributionControl: true,
          preferCanvas: false
        });
        
        mapInstanceRef.current = map;
        
        // Force visibility
        const container = mapRef.current.querySelector('.leaflet-container') as HTMLElement;
        if (container) {
          container.style.visibility = 'visible';
          container.style.opacity = '1';
          container.style.display = 'block';
        }

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c']
        }).addTo(map);

        // Force map to re-render and set ready
        setTimeout(() => {
          map.invalidateSize();
          setMapReady(true);
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Không thể khởi tạo bản đồ');
      }
    };

    // Start initialization with a small delay
    const timer = setTimeout(initMap, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4" style={{ zIndex: 1000, maxWidth: '280px' }}>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapIcon className="w-5 h-5" />
          Bản đồ phản ánh
        </h2>
        
        {/* Status Filter */}
        <div className="mb-3 pb-3 border-b">
          <p className="text-xs font-medium text-gray-600 mb-2">Lọc theo trạng thái:</p>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chờ xử lý
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusFilter === 'in_progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đang xử lý
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusFilter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã xong
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Từ chối
            </button>
          </div>
        </div>

        {/* Severity Legend */}
        <div className="space-y-1 text-sm">
          <p className="text-xs font-medium text-gray-600 mb-2">Mức độ nghiêm trọng:</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Mức độ thấp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Mức độ trung bình</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Mức độ cao</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Mức độ nghiêm trọng</span>
          </div>
        </div>
        
        {/* Report Count */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600">
            Hiển thị: {statusFilter === 'all' 
              ? reports.length 
              : reports.filter(r => r.status === statusFilter).length} / {reports.length} báo cáo
          </p>
        </div>
      </div>
      <div 
        ref={mapRef}
        id="map-container"
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          minHeight: '500px'
        }} 
      />
    </div>
  );
}

export default MapView;
