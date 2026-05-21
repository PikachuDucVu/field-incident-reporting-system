import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';
import type { ReportData } from '../services/api';
import { MapPin, FileText, AlertCircle, Camera, ArrowLeft, X, Upload } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function CreateReport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ReportData>({
    title: '',
    description: '',
    location: {
      latitude: 0,
      longitude: 0
    },
    pollutionType: 'traffic',
    severity: 'medium',
    images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const latitude = formData.location.latitude;
  const longitude = formData.location.longitude;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map centered at Hanoi
    const map = L.map(mapRef.current).setView([21.0285, 105.8542], 11);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add click handler to set location
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: lat,
          longitude: lng
        }
      }));

      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map)
          .bindPopup('Vị trí đã chọn')
          .openPopup();
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker when location changes from input fields
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (latitude !== 0 && longitude !== 0) {
      const latLng: L.LatLngExpression = [latitude, longitude];
      
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
      } else {
        markerRef.current = L.marker(latLng).addTo(mapInstanceRef.current)
          .bindPopup('Vị trí đã chọn');
      }
      
      // Center map on marker
      mapInstanceRef.current.setView(latLng, 13);
    }
  }, [latitude, longitude]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
          setLocationLoading(false);
        },
        () => {
          setError('Không thể lấy vị trí của bạn. Vui lòng nhập thủ công.');
          setLocationLoading(false);
        }
      );
    } else {
      setError('Trình duyệt không hỗ trợ định vị.');
      setLocationLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setImageLoading(true);
    setError('');

    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Vui lòng chỉ chọn file ảnh');
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Kích thước ảnh không được vượt quá 5MB');
        }

        // Convert to base64
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }

      // Limit to 5 images
      const totalImages = [...selectedImages, ...newImages].slice(0, 5);
      setSelectedImages(totalImages);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        images: totalImages
      }));

      if (totalImages.length >= 5) {
        setError('Tối đa 5 ảnh đã được thêm');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải ảnh');
    } finally {
      setImageLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createReport(formData);
      navigate('/reports');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Tạo phản ánh thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

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
              Tạo phản ánh hiện trường
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề phản ánh *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="VD: Kẹt xe kéo dài, đường hư hỏng, rác thải công nghiệp..."
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Mô tả hiện trạng: hư hỏng gì, đường xá như thế nào, mức độ ảnh hưởng, thời điểm phát hiện..."
              />
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tọa độ vị trí *
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {locationLoading ? 'Đang lấy vị trí...' : 'Sử dụng vị trí hiện tại'}
                </button>
              </div>
              
              {/* Interactive Map */}
              <div className="mb-4">
                <div 
                  ref={mapRef}
                  className="w-full h-64 border border-gray-300 rounded-lg"
                  style={{ minHeight: '256px' }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Nhấp vào bản đồ để chọn vị trí hoặc nhập tọa độ bên dưới
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="latitude" className="block text-xs text-gray-600 mb-1">
                    Vĩ độ
                  </label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.location.latitude || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 21.0285"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-xs text-gray-600 mb-1">
                    Kinh độ
                  </label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.location.longitude || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 105.8542"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Incident Category */}
            <div>
              <label htmlFor="pollutionType" className="block text-sm font-medium text-gray-700 mb-1">
                Loại phản ánh *
              </label>
              <select
                id="pollutionType"
                name="pollutionType"
                value={formData.pollutionType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="traffic">Giao thông</option>
                <option value="infrastructure">Hạ tầng hư hỏng</option>
                <option value="road">Đường xá</option>
                <option value="industrial_waste">Rác thải công nghiệp</option>
                <option value="environment">Môi trường</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                Mức độ nghiêm trọng *
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="critical">Nghiêm trọng</option>
              </select>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh hiện trường (tối đa 5 ảnh)
              </label>
              
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageLoading || selectedImages.length >= 5}
                />
                
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${
                    imageLoading || selectedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  {imageLoading ? (
                    <div className="text-gray-500">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm">Đang xử lý ảnh...</p>
                    </div>
                  ) : selectedImages.length >= 5 ? (
                    <div className="text-gray-500">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Đã đạt giới hạn 5 ảnh</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Nhấp để chọn ảnh hoặc kéo và thả
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF tối đa 5MB mỗi ảnh. Có thể chụp hiện trường/rác thải/hư hỏng để gửi lên.
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-700">
                      Đã chọn {selectedImages.length}/5 ảnh
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Ảnh ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedImages.length < 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  Bạn có thể thêm tối đa {5 - selectedImages.length} ảnh nữa
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang tạo phản ánh...' : 'Gửi phản ánh'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
