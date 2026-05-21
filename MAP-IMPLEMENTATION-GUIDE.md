# Bản đồ MapView Implementation Guide

## 🗺️ Tính năng đã được thực hiện

### 1. Bản đồ tương tác với Leaflet & React-Leaflet
- **Thư viện**: Leaflet 1.9.4 + React-Leaflet 4.2.1
- **TileLayer**: OpenStreetMap tiles
- **Hiển thị**: Bản đồ fullscreen 600px height
- **Responsive**: Tương tác tốt trên mobile và desktop

### 2. Custom Markers theo mức độ nghiêm trọng
- Màu sắc markers:
  - 🟢 Low (Thấp): `#10b981` (green)
  - 🟡 Medium (Trung bình): `#eab308` (yellow)
  - 🟠 High (Cao): `#f97316` (orange)
  - 🔴 Critical (Nghiêm trọng): `#ef4444` (red)
- **Animation**: Pulse effect cho markers
- **Hover effect**: Scale lên 1.1 khi hover

### 3. Interactive Popup
- **Thông tin hiển thị**:
  - Tiêu đề báo cáo
  - Mô tả ngắn (line-clamp-3)
  - Severity & Status badges với border
  - Người báo cáo + Thời gian
  - Tọa độ (format với 6 decimal places)
  - Số lượng hình ảnh đính kèm
  - Link xem chi tiết

### 4. Popup Styling
- **Modern design**: Rounded corners, soft shadows
- **Close button**: Hover effect with background
- **Link styling**: Smooth transitions
- **Responsive width**: 320px minimum
- **Padding & spacing**: Optimized readability

### 5. Map Controls & UI
- **Zoom controls**: Modern styling, rounded corners
- **Controls position**: Top-left corner
- **Attribution**: Blurred background, smaller text
- **Legend**: Color-coded severity indicators

### 6. Auto-centering
- **Smart centering**: Tự động center dựa trên trung bình tọa độ reports
- **Zoom level**: 10 (city-level view)
- **Fallback**: Default to Hanoi coordinates

### 7. Error Handling
- **Network errors**: User-friendly error messages
- **Loading states**: Animated loading indicator
- **Empty states**: Informative messages when no data

### 8. Report List (Bottom section)
- **6 reports**: Latest 6 reports in 2-column grid
- **Severity indicators**: Color-coded dots
- **Hover effects**: Light gray background on hover
- **Status badges**: Consistent styling with popup

## 🎨 CSS Customizations

### Custom Animations
```css
/* Marker pulse animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes ping {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
```

### Popup Styling
- Border-radius: 12px
- Modern box-shadows
- Custom close button
- Improved spacing

### Map Controls
- Border-radius: 8px
- Hover states
- Smooth transitions

## 📍 Dữ liệu Test

Để test bản đồ, cần tạo reports với tọa độ. Sample data locations:

| Location | Lat | Lng |
|-----------|-----|-----|
| Sông Hồng | 21.0285 | 105.8542 |
| Hồ Tây | 21.0488 | 105.8086 |
| Kênh Nhuệ | 21.0085 | 105.8642 |
| Hà Nội Center | 20.9908 | 105.8235 |

## 🚀 Cách sử dụng

### 1. Start Backend
```bash
cd backend
bun start
```

### 2. Start Admin App
```bash
cd apps/admin-app
bun run dev
```

### 3. Access Map
- URL: `http://localhost:3001/admin/map`
- Admin login required

### 4. Create Test Reports (Optional)
Sử dụng API endpoint:
```bash
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Report",
  "description": "Test description",
  "pollutionType": "chemical",
  "severity": "high",
  "location": {
    "latitude": 21.0285,
    "longitude": 105.8542
  }
}
```

## 🔧 Technical Details

### Dependencies
- `leaflet`: ^1.9.4
- `react-leaflet`: ^4.2.1
- `@types/leaflet`: ^1.9.8
- `react-router-dom`: ^7.2.1

### Key Components
- `MapContainer`: Main map wrapper
- `TileLayer`: OpenStreetMap tiles
- `Marker`: Custom markers with icons
- `Popup`: Rich information popup
- `MapCenter`: Dynamic centering

### Marker Icon Generation
```tsx
const createCustomIcon = (severity: string) => {
  const colors = {
    low: '#10b981', medium: '#eab308', 
    high: '#f97316', critical: '#ef4444'
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${colors[severity]}..."></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};
```

## 🎯 Features Implemented

✅ **Core Features**
- Interactive map display
- Custom colored markers
- Rich popup content
- Auto-centering
- Error handling

✅ **UI/UX**
- Modern styling
- Smooth animations
- Hover effects
- Responsive design
- Loading states

✅ **Data Integration**
- Real API data fetching
- Dynamic marker generation
- Proper coordinate handling

✅ **Navigation**
- Direct links to detail pages
- React Router integration

## 🐛 Troubleshooting

### Common Issues

1. **Markers not showing**
   - Check if Leaflet CSS is imported
   - Verify coordinates format
   - Check for JS errors in console

2. **Popup not opening**
   - Check React-Leaflet version compatibility
   - Verify Marker components have children

3. **Map not rendering**
   - Ensure container has height
   - Check CSS conflicts
   - Verify Leaflet initialization

4. **API errors**
   - Check backend server is running
   - Verify authentication
   - Check CORS settings

## 🚀 Future Enhancements

### Potential Improvements
1. **Marker Clustering**: Handle dense marker areas
2. **Heat Map Layer**: Show pollution density
3. **Custom Basemaps**: Add satellite/hybrid options
4. **Drawing Tools**: Allow users to mark areas
5. **Geofencing**: Define pollution zones
6. **Real-time Updates**: WebSocket for live data
7. **Export Functionality**: Download map as image/PDF
8. **Route Planning**: Show fastest cleanup routes

### Performance Optimizations
1. **Virtual Markers**: For large datasets
2. **Tile Caching**: Local tile storage
3. **Lazy Loading**: Popup content on demand
4. **Debounced Updates**: Optimize re-renders

## 📝 Notes

- Bản đồ sử dụng OpenStreetMap miễn phí
- Coordinates theo format [latitude, longitude]
- Popup sử dụng Link từ react-router-dom
- CSS animations pure CSS fallback
- Error handling user-friendly
- Mobile-responsive design

Ready for production use! 🎉
