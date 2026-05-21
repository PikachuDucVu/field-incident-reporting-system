# Hệ Thống Báo Cáo Ô Nhiễm Nước - WebGIS

Hệ thống WebGIS toàn diện để báo cáo và quản lý các sự cố ô nhiễm nước. Được xây dựng với kiến trúc monorepo Turbo sử dụng Bun runtime, bao gồm ứng dụng React mobile cho người dùng và dashboard quản trị cho quản lý.

## 🌟 Tính năng

### Ứng dụng Mobile (Cổng 3000)
- **Xác thực người dùng** - Hệ thống đăng nhập và đăng ký bảo mật
- **Báo cáo ô nhiễm** - Tạo báo cáo ô nhiễm nước chi tiết với:
  - Tiêu đề và mô tả
  - Theo dõi vị trí GPS
  - Loại ô nhiễm (hóa chất, sinh học, vật lý, nhiệt, khác)
  - Mức độ nghiêm trọng (thấp, trung bình, cao, nghiêm trọng)
  - Hỗ trợ tải ảnh lên (tính năng tương lai)
- **Quản lý báo cáo** - Xem, lọc và theo dõi trạng thái báo cáo đã gửi
- **Thiết kế responsive** - Tối ưu cho thiết bị di động

### Dashboard Quản Trị (Cổng 3001)
- **Xác thực quản trị** - Truy cập chỉ dành cho admin với bảo mật
- **Tổng quan dashboard** - Thống kê và số liệu theo thời gian thực
- **Quản lý báo cáo** - Các thao tác CRUD đầy đủ trên tất cả báo cáo
- **Quản lý trạng thái** - Cập nhật trạng thái báo cáo (chờ xử lý → đang xử lý → đã giải quyết/từ chối)
- **Xem bản đồ** - Trực quan hóa báo cáo theo địa lý (tích hợp bản đồ thực tế)
- **Tìm kiếm & Lọc** - Khả năng lọc nâng cao

### Backend API (Cổng 3002)
- **RESTful API** - Được xây dựng với framework Hono và Bun runtime
- **Xác thực** - Xác thực dựa trên JWT với kiểm soát truy cập theo vai trò
- **Cơ sở dữ liệu** - MongoDB với Mongoose ODM
- **Truy vấn địa lý** - Khả năng tìm kiếm dựa trên vị trí
- **Phân quyền** - Quản lý vai trò người dùng và quản trị viên

## 🏗️ Kiến trúc

```
water-pollution-gis/
├── apps/
│   ├── mobile-app/     # Ứng dụng React mobile (Cổng 3000)
│   └── admin-app/      # Dashboard quản trị React (Cổng 3001)
├── backend/            # API Hono + Bun (Cổng 3002)
└── turbo.json         # Cấu hình monorepo
```

## 🚀 Bắt đầu nhanh

### Yêu cầu
- **Node.js** (v18+)
- **Bun** (phiên bản mới nhất)
- **MongoDB** (chạy local hoặc connection string)

### 1. Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd water-pollution-gis

# Cài đặt dependencies cho tất cả packages
bun install
```

### 2. Cấu hình môi trường

Tạo file `.env` trong mỗi ứng dụng frontend:

**Mobile App** (`apps/mobile-app/.env`):
```
VITE_API_URL=http://localhost:3002/api
```

**Admin App** (`apps/admin-app/.env`):
```
VITE_API_URL=http://localhost:3002/api
```

**Backend** (biến môi trường):
```bash
# Tùy chọn: MongoDB connection string
# Mặc định: mongodb://localhost:27017/water-pollution-gis
export MONGODB_URI="mongodb://localhost:27017/water-pollution-gis"

# Tùy chọn: JWT secret
# Mặc định: your-secret-key
export JWT_SECRET="your-super-secret-jwt-key"

# Tùy chọn: Server port
# Mặc định: 3002
export PORT=3002
```

### 3. Cài đặt cơ sở dữ liệu

Khởi động MongoDB hoặc đảm bảo nó đang chạy:
```bash
# Sử dụng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Hoặc khởi động MongoDB service local
mongod
```

### 4. Chạy ứng dụng

#### Tùy chọn A: Chạy tất cả services cùng lúc
```bash
# Chạy backend, mobile app và admin app cùng nhau
bun run dev:all
```

#### Tùy chọn B: Chạy từng service riêng lẻ

**Backend API:**
```bash
bun run dev:backend
# API chạy trên http://localhost:3002
```

**Mobile App:**
```bash
bun run dev:mobile
# App chạy trên http://localhost:3000
```

**Admin Dashboard:**
```bash
bun run dev:admin
# Dashboard chạy trên http://localhost:3001
```

### 5. Truy cập ứng dụng

- **Mobile App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3002/api

## 📱 Hướng dẫn sử dụng

### Sử dụng ứng dụng Mobile

1. **Đăng ký tài khoản**
   - Truy cập http://localhost:3000
   - Nhấn "Register here"
   - Điền tên người dùng, email và mật khẩu

2. **Tạo báo cáo**
   - Sau khi đăng nhập, nhấn "New Report"
   - Điền chi tiết báo cáo
   - Sử dụng vị trí hiện tại hoặc nhập tọa độ thủ công
   - Gửi báo cáo

3. **Theo dõi báo cáo**
   - Xem tất cả báo cáo đã gửi trong danh sách chính
   - Lọc theo trạng thái (chờ xử lý, đang xử lý, đã giải quyết)
   - Nhấn vào bất kỳ báo cáo nào để xem chi tiết

### Sử dụng Dashboard Quản Trị

1. **Đăng nhập Admin**
   - Truy cập http://localhost:3001
   - Sử dụng thông tin đăng nhập admin (vai trò phải là 'admin' trong database)
   - Đăng ký người dùng admin nếu cần với vai trò 'admin'

2. **Xem xét báo cáo**
   - Dashboard hiển thị thống kê tổng quan
   - Di chuyển đến phần "Reports"
   - Lọc và tìm kiếm báo cáo

3. **Quản lý trạng thái báo cáo**
   - Nhấn vào bất kỳ báo cáo nào để xem chi tiết
   - Cập nhật trạng thái: chờ xử lý → đang xử lý → đã giải quyết/từ chối
   - Thêm ghi chú admin để theo dõi nội bộ

## 🛠️ Phát triển

### Build cho Production

```bash
# Build tất cả ứng dụng
bun run build

# Build từng ứng dụng riêng lẻ
cd apps/mobile-app && bun run build
cd apps/admin-app && bun run build
cd backend && bun run build
```

### Scripts của dự án

```bash
# Phát triển
bun run dev              # Chạy tất cả apps với Turbo
bun run dev:backend      # Chỉ Backend
bun run dev:mobile       # Chỉ Mobile app  
bun run dev:admin        # Chỉ Admin dashboard
bun run dev:all          # Tất cả services đồng thời

# Production
bun run build            # Build tất cả apps
```

## 📊 API Endpoints

### Xác thực
- `POST /api/auth/register` - Đăng ký người dùng
- `POST /api/auth/login` - Đăng nhập người dùng
- `GET /api/auth/profile` - Lấy thông tin người dùng

### Báo cáo
- `GET /api/reports` - Lấy tất cả báo cáo (với tùy chọn lọc)
- `POST /api/reports` - Tạo báo cáo mới
- `GET /api/reports/:id` - Lấy báo cáo cụ thể
- `PUT /api/reports/:id/status` - Cập nhật trạng thái báo cáo (chỉ admin)
- `GET /api/reports/nearby` - Lấy báo cáo gần đó

## 🗄️ Schema cơ sở dữ liệu

### Model User
```javascript
{
  username: String,
  email: String, 
  password: String, // đã mã hóa
  role: String, // 'user' | 'admin'
  createdAt: Date,
  updatedAt: Date
}
```

### Model Pollution Report
```javascript
{
  title: String,
  description: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  pollutionType: String, // 'chemical' | 'biological' | 'physical' | 'thermal' | 'other'
  severity: String, // 'low' | 'medium' | 'high' | 'critical'
  status: String, // 'pending' | 'in_progress' | 'resolved' | 'rejected'
  reporterId: ObjectId,
  adminId: ObjectId, // tùy chọn
  adminNotes: String, // tùy chọn
  images: [String], // tính năng tương lai
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Cấu hình

### Biến môi trường

**Backend Environment:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port

**Frontend Environment:**
- `VITE_API_URL` - Backend API URL

## 🚀 Cải tiến tương lai

1. **Tích hợp bản đồ thực** - Thay thế bản đồ placeholder bằng Leaflet/Google Maps thực tế
2. **Tải ảnh lên** - Thêm chức năng tải ảnh cho báo cáo
3. **Thông báo thời gian thực** - Tích hợp WebSocket cho cập nhật trực tiếp
4. **Thông báo Email** - Cảnh báo tự động cho thay đổi trạng thái
5. **Phân tích nâng cao** - Báo cáo và số liệu tinh vi hơn
6. **Mobile App PWA** - Khả năng Progressive Web App
7. **Hỗ trợ offline** - Service workers cho báo cáo offline

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Thực hiện thay đổi của bạn
4. Thêm tests nếu có thể
5. Gửi pull request

## 📄 Giấy phép

Dự án này được cấp phép theo MIT License.

## 🆘 Khắc phục sự cố

### Các vấn đề thường gặp

1. **Kết nối MongoDB thất bại**
   - Đảm bảo MongoDB đang chạy trên cổng 27017
   - Kiểm tra biến môi trường MONGODB_URI
   - Xác minh database tồn tại và có thể truy cập

2. **Lỗi CORS**
   - Kiểm tra API URLs khớp trong file .env frontend
   - Đảm bảo headers được đặt đúng trong cấu hình CORS backend

3. **Vấn đề xác thực**
   - Xác minh JWT_SECRET được đặt cho backend
   - Kiểm tra lưu trữ token trong localStorage của browser
   - Đảm bảo vai trò người dùng đúng khi truy cập tính năng admin

4. **Lỗi Build**
   - Chạy `bun install` trong tất cả packages
   - Kiểm tra lỗi TypeScript với `bunx tsc --noEmit`
   - Xác minh dependencies tương thích

### Mẹo phát triển

1. Sử dụng scripts monorepo để thuận tiện
2. Kiểm tra console browser để xem thông báo lỗi chi tiết
3. Sử dụng Postman/Insomnia để test API
4. Kiểm tra MongoDB Compass để xem trạng thái database
5. Xem lại logs backend để phát hiện vấn đề API

---

Được xây dựng với ❤️ sử dụng Bun, Hono, React và MongoDB.

## 📚 Tài liệu khác

- [DOCUMENTATION.md](DOCUMENTATION.md) - Tài liệu chi tiết bằng tiếng Việt
- [ADMIN-LOGIN-GUIDE.md](ADMIN-LOGIN-GUIDE.md) - Hướng dẫn đăng nhập Admin
- [MAP-IMPLEMENTATION-GUIDE.md](MAP-IMPLEMENTATION-GUIDE.md) - Hướng dẫn triển khai bản đồ
- [MAP-SOLUTION.md](MAP-SOLUTION.md) - Giải pháp bản đồ
