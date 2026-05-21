# Hướng dẫn Admin Login

## Thông tin đăng nhập Admin (Mặc định)

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Username**: `admin`

## Cách để tạo tài khoản Admin

### 1. Sử dụng Script PowerShell (Recommend)

```powershell
# Mở PowerShell trong thư mục dự án
cd C:\Users\ducvu\water-pollution-gis

# Chạy script tạo admin
.\scripts\setup-admin.ps1
```

### 2. Sử dụng API trực tiếp

Để tạo admin account, gọi API endpoint:

```json
POST http://localhost:3002/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com", 
  "password": "admin123",
  "role": "admin"
}
```

### 3. Tạo thủ công qua Database

Nếu bạn có quyền truy cập MongoDB Atlas:

1. Login vào MongoDB Atlas
2. Connect to cluster `cluster0.wln3gzm.mongodb.net`
3. Select database `water-pollution-gis`
4. In collection `users`, insert document:

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "$2a$10$hashed_password",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Cách sử dụng system

### 1. Khởi động Backend

```bash
cd backend
bun start
```

Backend sẽ chạy trên port 3002

### 2. Khởi động Mobile App

```bash
cd apps/mobile-app
bun run dev
```

Mobile app sẽ chạy trên port 3000

### 3. Khởi động Admin App

```bash
cd apps/admin-app
bun run dev
```

Admin app sẽ chạy trên port 3001

### 4. Đăng nhập Admin Panel

1. Mở trình duyệt
2. Truy cập: `http://localhost:3001/admin/login`
3. Nhập email và password của admin
4. Click "Đăng nhập"

## Sau khi đăng nhập thành công

Bạn sẽ được chuyển đến Dashboard với các tính năng:

- **📊 Dashboard**: Tổng quan thống kê báo cáo
- **📋 Reports Management**: Quản lý danh sách báo cáo
- **🗺️ Map View**: Xem bản đồ các điểm ô nhiễm
- **⚙️ Admin Actions**: Phê duyệt, từ chối, cập nhật trạng thái báo cáo

## Các endpoint API chính

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký (có thể set role: 'admin')
- `GET /api/auth/profile` - Xem thông tin profile
- `GET /api/reports` - Lấy danh sách báo cáo
- `POST /api/reports` - Tạo báo cáo mới
- `PUT /api/reports/:id/status` - Cập nhật trạng thái báo cáo

## Hướng dẫn sử dụng Admin Panel

### 1. Xem Dashboard
- Xem tổng số báo cáo
- Thống kê theo trạng thái (chờ xử lý, đang xử lý, đã giải quyết)
- Cảnh báo các báo cáo mức độ nghiêm trọng

### 2. Quản lý Báo cáo
- **Filter**: Lọc báo cáo theo trạng thái
- **Search**: Tìm kiếm báo cáo theo tiêu đề, mô tả, người báo cáo
- **View Details**: Xem chi tiết từng báo cáo
- **Update Status**: 
  - "Bắt đầu xử lý" - Chuyển từ pending → in_progress
  - "Đánh dấu đã giải quyết" - Chuyển từ in_progress → resolved
  - "Từ chối báo cáo" - Chuyển sang rejected

### 3. X bản đồ
- Xem vị trí các báo cáo trên bản đồ
- Màu sắc theo mức độ nghiêm trọng:
  - 🟢 Low (Thấp)
  - 🟡 Medium (Trung bình) 
  - 🟠 High (Cao)
  - 🔴 Critical (Nghiêm trọng)

### 4. Chi tiết Báo cáo
- Xem đầy đủ thông tin báo cáo
- Xem hình ảnh đính kèm
- Thêm ghi chú quản trị viên
- Cập nhật trạng thái

## Lưu ý quan trọng

1. **Security**: Hãy thay đổi mật khẩu admin mặc định trong môi trường production
2. **Database**: MongoDB Atlas đang được sử dụng với connection string trong file `.env`
3. **Environment**: Các biến môi trường được config trong `backend/.env`
4. **Ports**: 
   - Backend API: 3002
   - Mobile App: 3000  
   - Admin Panel: 3001

## Xử lý lỗi thường gặp

### "Cannot connect to MongoDB"
- Kiểm tra kết nối internet
- Xác nhận MongoDB Atlas credentials
- Check IP whitelist trong MongoDB Atlas

### "Failed to create admin account"
- Đảm bảo backend server đang chạy
- Kiểm tra port 3002 có available không
- Verify API endpoint đang hoạt động

### "Login failed"  
- Kiểm tra email và password
- Đảm bảo user đã được tạo với role 'admin'
- Verify tokens are being generated correctly

## Contact & Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console log của backend
2. Verify database connection
3. Check network requests in browser dev tools
4. Ensure all services are running correctly
