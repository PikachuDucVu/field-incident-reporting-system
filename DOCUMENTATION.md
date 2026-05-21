# 📖 TÀI LIỆU DỰ ÁN HỆ THỐNG BÁO CÁO Ô NHIỄM NƯỚC (WATER POLLUTION GIS)

## 📋 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Chi tiết Backend](#3-chi-tiết-backend)
4. [Chi tiết Admin App](#4-chi-tiết-admin-app)
5. [Chi tiết Mobile App](#5-chi-tiết-mobile-app)
6. [Database Schema](#6-database-schema)
7. [API Documentation](#7-api-documentation)
8. [Hướng dẫn cài đặt](#8-hướng-dẫn-cài-đặt)
9. [Hướng dẫn sử dụng](#9-hướng-dẫn-sử-dụng)
10. [Các tính năng đã triển khai](#10-các-tính-năng-đã-triển-khai)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Giới thiệu
**Water Pollution GIS** là hệ thống WebGIS toàn diện cho phép người dân báo cáo và quản lý các sự cố ô nhiễm nước. Hệ thống được xây dựng dựa trên kiến trúc monorepo với Turbo, sử dụng Bun runtime, bao gồm:
- Ứng dụng Mobile cho người dùng cuối
- Dashboard quản trị cho admin
- Backend API RESTful

### 1.2. Mục tiêu
- ✅ Cho phép người dân dễ dàng báo cáo ô nhiễm nước
- ✅ Cung cấp công cụ quản lý hiệu quả cho cơ quan chức năng
- ✅ Visualize dữ liệu địa lý trên bản đồ tương tác
- ✅ Theo dõi trạng thái xử lý báo cáo theo thời gian thực
- ✅ Phân tích và thống kê dữ liệu ô nhiễm

### 1.3. Công nghệ sử dụng

#### Backend
- **Runtime**: Bun (JavaScript runtime nhanh hơn Node.js)
- **Framework**: Hono (Web framework hiệu suất cao)
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs (mã hóa mật khẩu)

#### Frontend
- **Framework**: React 19.2.0
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts (cho Dashboard)

#### DevOps
- **Monorepo**: Turbo
- **Package Manager**: Bun
- **Version Control**: Git

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Cấu trúc thư mục

```
water-pollution-gis/
├── apps/
│   ├── mobile-app/              # Ứng dụng người dùng (Port 3000)
│   │   ├── src/
│   │   │   ├── components/      # Các React components
│   │   │   ├── contexts/        # Context API (AuthContext)
│   │   │   ├── pages/           # Các trang chính
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ReportList.tsx
│   │   │   │   ├── CreateReport.tsx
│   │   │   │   └── ReportDetail.tsx
│   │   │   ├── services/        # API services
│   │   │   ├── utils/           # Utility functions
│   │   │   └── App.tsx
│   │   ├── .env                 # Environment variables
│   │   └── package.json
│   │
│   └── admin-app/               # Ứng dụng quản trị (Port 3001)
│       ├── src/
│       │   ├── components/      # React components
│       │   │   └── Layout.tsx
│       │   ├── contexts/        # Context API
│       │   ├── pages/           # Các trang chính
│       │   │   ├── AdminLogin.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── ReportsList.tsx
│       │   │   ├── ReportDetail.tsx
│       │   │   └── MapView.tsx
│       │   ├── services/        # API services
│       │   ├── styles/          # CSS files
│       │   └── App.tsx
│       ├── .env
│       └── package.json
│
├── backend/                     # Backend API (Port 3002)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── pollutionController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── PollutionReport.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── pollution.ts
│   │   └── utils/
│   │       └── database.ts
│   ├── index.ts                 # Entry point
│   └── package.json
│
├── scripts/                     # Utility scripts
│   ├── create-admin.js
│   ├── create-test-data.js
│   └── create-test-reports.js
│
├── package.json                 # Root package.json
├── turbo.json                   # Turbo config
├── README.md
└── DOCUMENTATION.md             # File này
```

### 2.2. Luồng dữ liệu

```
┌─────────────────┐
│   Mobile App    │
│   (Port 3000)   │
│  React + Vite   │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │ (Axios)
         ↓
┌─────────────────┐      ┌──────────────┐
│   Admin App     │      │   Backend    │
│   (Port 3001)   │ ───→ │ (Port 3002)  │
│  React + Vite   │      │  Hono + Bun  │
└─────────────────┘      └──────┬───────┘
                                │
                                │ Mongoose
                                ↓
                         ┌──────────────┐
                         │   MongoDB    │
                         │ (Port 27017) │
                         └──────────────┘
```

### 2.3. Authentication Flow

```
User/Admin
    │
    ├─→ POST /api/auth/register
    │       │
    │       └─→ Hash password (bcryptjs)
    │       └─→ Save to MongoDB
    │
    ├─→ POST /api/auth/login
    │       │
    │       └─→ Verify password
    │       └─→ Generate JWT token
    │       └─→ Return token + user info
    │
    └─→ Protected Routes
            │
            └─→ Send JWT in Authorization header
            └─→ Middleware verifies token
            └─→ Attach user to request context
            └─→ Allow/Deny access based on role
```

---

## 3. CHI TIẾT BACKEND

### 3.1. Cấu trúc API

#### Entry Point (`index.ts`)
```typescript
- Khởi tạo Hono app
- Setup middleware:
  * Logger
  * CORS (cho phép localhost:3000, localhost:3001)
- Mount routes:
  * /api/auth (Authentication)
  * /api/reports (Pollution reports)
- Error handlers
- Start Bun server
```

### 3.2. Controllers

#### `authController.ts`
**Chức năng**: Xử lý đăng ký, đăng nhập, lấy profile

**Endpoints**:
- `register(c: Context)` - Đăng ký user mới
  - Validate input
  - Hash password với bcryptjs
  - Tạo user trong DB
  - Generate JWT token
  - Return token + user info

- `login(c: Context)` - Đăng nhập
  - Tìm user theo email
  - So sánh password (bcryptjs.compare)
  - Generate JWT token
  - Return token + user info

- `getProfile(c: Context)` - Lấy thông tin user
  - Yêu cầu authentication
  - Return user info từ context

#### `pollutionController.ts`
**Chức năng**: CRUD operations cho báo cáo ô nhiễm

**Endpoints**:

1. `createReport(c: Context)` - Tạo báo cáo mới
   - Validate user authentication
   - Parse location data
   - Save report với reporterId
   - Return created report

2. `getReports(c: Context)` - Lấy danh sách báo cáo
   - Support filtering: status, page, limit
   - User thường: chỉ thấy báo cáo của mình
   - Admin: thấy tất cả báo cáo
   - Populate reporterId và adminId
   - Return paginated results

3. `getReportById(c: Context)` - Lấy chi tiết báo cáo
   - Validate ObjectId
   - Check permissions
   - Populate relationships
   - Return full report details

4. `updateReportStatus(c: Context)` - Cập nhật trạng thái
   - **Admin only**
   - Update status + adminNotes
   - Assign adminId
   - Return updated report

5. `getNearbyReports(c: Context)` - Tìm báo cáo gần vị trí
   - Use MongoDB geospatial query ($near)
   - Parameters: latitude, longitude, radius
   - Optional status filter
   - Return sorted by distance

### 3.3. Models

#### User Model (`User.ts`)
```typescript
interface IUser {
  username: string;      // Unique
  email: string;         // Unique, lowercase
  password: string;      // Hashed với bcryptjs
  role: 'user' | 'admin'; // Default: 'user'
  createdAt: Date;
  updatedAt: Date;
}
```

#### Pollution Report Model (`PollutionReport.ts`)
```typescript
interface IPollutionReport {
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  pollutionType: 'chemical' | 'biological' | 'physical' | 'thermal' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  reporterId: ObjectId;     // Reference to User
  adminId?: ObjectId;       // Reference to User (admin)
  adminNotes?: string;      // Ghi chú của admin
  images?: string[];        // Base64 hoặc URLs
  createdAt: Date;
  updatedAt: Date;
}

// Indexes:
- location: 2dsphere (cho geospatial queries)
```

### 3.4. Middleware

#### Authentication Middleware (`auth.ts`)
```typescript
export const authenticate = async (c: Context, next: Next) => {
  // 1. Lấy token từ Authorization header
  // 2. Verify JWT token
  // 3. Tìm user trong database
  // 4. Gán user vào context: c.set('user', user)
  // 5. Call next()
  // Error: return 401 Unauthorized
}

export const requireAdmin = async (c: Context, next: Next) => {
  // 1. Check user.role === 'admin'
  // 2. If not admin: return 403 Forbidden
  // 3. Call next()
}
```

### 3.5. Database Connection

#### `utils/database.ts`
```typescript
- Connect to MongoDB using Mongoose
- URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/water-pollution-gis'
- Options: 
  * useNewUrlParser
  * useUnifiedTopology
- Event handlers:
  * connected
  * error
  * disconnected
```

### 3.6. Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/water-pollution-gis

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3002
```

---

## 4. CHI TIẾT ADMIN APP

### 4.1. Cấu trúc Pages

#### `AdminLogin.tsx`
- Form đăng nhập cho admin
- Validate email + password
- Call API: POST /api/auth/login
- Lưu token vào localStorage
- Redirect to Dashboard

#### `Dashboard.tsx`
**Tính năng**:
- 📊 Thống kê tổng quan:
  * Tổng số báo cáo
  * Báo cáo đang chờ xử lý
  * Báo cáo đang xử lý
  * Báo cáo đã giải quyết
  * Báo cáo bị từ chối
- 📈 Biểu đồ:
  * Phân bố theo mức độ nghiêm trọng (severity)
  * Phân bố theo loại ô nhiễm (pollutionType)
  * Line chart xu hướng theo thời gian
- 🔄 Auto-refresh stats
- 🔗 Quick links đến Reports List và Map View

#### `ReportsList.tsx`
**Tính năng**:
- 📋 Hiển thị danh sách báo cáo dạng bảng
- 🔍 Search bar (tìm theo title, description, username)
- 🎛️ Filter theo trạng thái:
  * Tất cả
  * Đã gửi yêu cầu (pending)
  * Đang xử lý (in_progress)
  * Đã xử lý xong (resolved)
  * Từ chối (rejected)
- 📊 Hiển thị:
  * Title + Description
  * Người báo cáo (username, email)
  * Vị trí (coordinates)
  * Mức độ nghiêm trọng (severity badge)
  * Trạng thái (status badge)
  * Hình ảnh (thumbnails)
- ⚡ Quick actions:
  * "Bắt đầu xử lý" (pending → in_progress)
  * "Hoàn thành" (in_progress → resolved)
  * "Từ chối" (pending/in_progress → rejected)
  * Link đến chi tiết

#### `ReportDetail.tsx`
**Tính năng**:
- 📝 Hiển thị đầy đủ thông tin báo cáo:
  * Header: Title, Người báo cáo, Timestamp
  * Severity badge + Status badge
  * Description (full text)
  * Location coordinates
  * Gallery hình ảnh (click để xem full size)
  
- 🎯 **Hành động quản trị viên**:
  * Hiển thị trạng thái hiện tại (gradient box với icon)
  * Spinner khi đang cập nhật
  * **Ghi chú quản trị viên**:
    - Textarea để nhập ghi chú
    - Hiển thị ghi chú cũ (nếu có)
    - Ghi chú được lưu cùng với thay đổi trạng thái
  * **Thay đổi trạng thái**:
    - Từ "Đã gửi yêu cầu":
      + Nút "Bắt đầu xử lý" (blue)
      + Nút "Từ chối báo cáo" (red)
    - Từ "Đang xử lý":
      + Nút "Hoàn thành xử lý" (green)
      + Nút "Từ chối báo cáo" (red)
    - Từ "Đã xử lý xong" hoặc "Từ chối":
      + Thông báo: "Không thể thay đổi trạng thái"
  * **Xác nhận trước khi thay đổi**:
    - Popup confirm: "Bạn có chắc chắn muốn chuyển trạng thái sang [Tên trạng thái]?"
    - Alert lỗi nếu cập nhật thất bại
  
- 📋 Thông tin chi tiết:
  * Loại ô nhiễm
  * Trạng thái (Vietnamese label)
  * Mức độ nghiêm trọng
  * Report ID
  * Người báo cáo (username + email)
  * Người xử lý (nếu có)
  * Ngày tạo
  * Cập nhật lần cuối

#### `MapView.tsx`
**Tính năng**:
- 🗺️ Bản đồ tương tác (Leaflet):
  * Hiển thị tất cả báo cáo trên map
  * Markers màu theo severity:
    - 🟢 Green: low
    - 🟡 Yellow: medium
    - 🟠 Orange: high
    - 🔴 Red: critical
  * Click marker → popup với thông tin:
    - Title
    - Description
    - Mức độ
    - Trạng thái (Vietnamese)
    - Link "Xem chi tiết"
  
- 🎛️ **Control Panel** (top-left):
  * Tiêu đề "Bản đồ ô nhiễm"
  * **Filter theo trạng thái**:
    - Tất cả
    - Chờ xử lý (pending)
    - Đang xử lý (in_progress)
    - Đã xong (resolved)
    - Từ chối (rejected)
  * **Legend mức độ nghiêm trọng**:
    - Dots màu + labels
  * **Report count**: "Hiển thị: X / Y báo cáo"

- 🎯 Auto-center & Auto-zoom:
  * Single report: zoom to location
  * Multiple reports: fitBounds với padding

### 4.2. Components

#### `Layout.tsx`
**Chức năng**: Sidebar navigation + Main content area

**Sidebar Menu**:
- 📊 Dashboard
- 📋 Báo cáo
- 🗺️ Bản đồ
- 🚪 Đăng xuất

**Features**:
- Active link highlighting
- Responsive design
- Logout functionality

### 4.3. Services

#### `api.ts`
```typescript
// API Client setup
const apiClient = axios.create({
  baseURL: VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Token management
export const setAuthToken = (token: string)

// API methods
export const auth = {
  login: (email, password),
  getProfile: ()
}

export const reports = {
  getAll: (params?: { status, page, limit }),
  getById: (id),
  updateStatus: (id, status, adminNotes)
}
```

### 4.4. Vietnamese Status Labels

```typescript
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Đã gửi yêu cầu';
    case 'in_progress': return 'Đang xử lý';
    case 'resolved': return 'Đã xử lý xong';
    case 'rejected': return 'Từ chối';
    default: return status;
  }
}
```

---

## 5. CHI TIẾT MOBILE APP

### 5.1. Cấu trúc Pages

#### `Login.tsx`
- Form đăng nhập
- Input: email, password
- Call API: POST /api/auth/login
- Lưu token + user info
- Redirect to Reports List

#### `Register.tsx`
- Form đăng ký
- Input: username, email, password, confirm password
- Validate password match
- Call API: POST /api/auth/register
- Auto login sau khi register

#### `ReportList.tsx`
**Tính năng**:
- 📋 Danh sách báo cáo của user
- Header:
  * Logo + Title
  * Welcome message
  * Logout button
- 🎛️ Filter tabs:
  * Tất cả
  * Chờ xử lý
  * Đang xử lý
  * Đã giải quyết
- ➕ Nút "Tạo báo cáo mới" (floating)
- 📊 Report cards:
  * Title + Description (line-clamp-2)
  * Location coordinates
  * Timestamp
  * Reporter username
  * Severity badge
  * Status badge
  * Link "Xem chi tiết →"
- 📭 Empty state với call-to-action

#### `CreateReport.tsx`
**Tính năng**:
- 📝 **Form nhập liệu**:
  * Tiêu đề báo cáo (required)
  * Mô tả chi tiết (textarea, required)
  * Loại ô nhiễm (select):
    - Hóa học
    - Sinh học
    - Vật lý
    - Nhiệt
    - Khác
  * Mức độ nghiêm trọng (select):
    - Thấp
    - Trung bình
    - Cao
    - Nghiêm trọng

- 🗺️ **Bản đồ tương tác** (Leaflet):
  * Hiển thị map 256px height
  * Center mặc định: **Hà Nội** (21.0285, 105.8542)
  * **Click vào map để chọn vị trí**:
    - Marker xuất hiện tại vị trí click
    - Auto-update latitude/longitude inputs
    - Popup "Vị trí đã chọn"
  * **Sync 2 chiều**:
    - Click map → update inputs
    - Nhập inputs → update marker + center map
  * Hint: "💡 Nhấp vào bản đồ để chọn vị trí hoặc nhập tọa độ bên dưới"

- 📍 **Tọa độ vị trí**:
  * Input fields: Vĩ độ, Kinh độ
  * Nút "Sử dụng vị trí hiện tại":
    - Get GPS location
    - Update map + marker
    - Auto-center
  * Có thể nhập thủ công

- 📷 **Upload hình ảnh** (tối đa 5 ảnh):
  * Drag & drop area
  * Click để chọn file
  * Validate:
    - File type: image/*
    - File size: max 5MB/ảnh
  * Convert to Base64
  * Preview thumbnails (2 columns grid)
  * Nút X để xóa ảnh
  * Counter: "Đã chọn X/5 ảnh"
  * Loading spinner khi upload

- 🎯 **Actions**:
  * Nút "Hủy": quay lại
  * Nút "Gửi báo cáo": submit form
  * Loading state: "Đang tạo báo cáo..."

#### `ReportDetail.tsx`
**Tính năng**:
- 📝 Hiển thị đầy đủ thông tin:
  * Title
  * Status badge + Severity badge
  * Description
  * Location coordinates
  * Pollution type
  * Created date
  * Updated date
  * Reporter info
  * Admin notes (nếu có)
- 🖼️ Image gallery (nếu có)
- 🔙 Back button

### 5.2. Context API

#### `AuthContext.tsx`
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email, password) => Promise<void>;
  register: (userData) => Promise<void>;
  logout: () => void;
}

// Provide:
- User state management
- Token persistence (localStorage)
- Auto-rehydrate on app load
- Protected routes helper
```

### 5.3. Protected Routes

```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
```

---

## 6. DATABASE SCHEMA

### 6.1. Collections

#### users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique, lowercase),
  password: String (hashed),
  role: String ('user' | 'admin'),
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
- email: unique
- username: unique
```

#### pollutionreports
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  location: {
    type: 'Point',
    coordinates: [Number, Number] // [lng, lat]
  },
  pollutionType: String,
  severity: String,
  status: String (default: 'pending'),
  reporterId: ObjectId (ref: 'User'),
  adminId: ObjectId (ref: 'User', optional),
  adminNotes: String (optional),
  images: [String],
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
- location: 2dsphere (geospatial)
- reporterId: 1
- status: 1
- createdAt: -1
```

### 6.2. Relationships

```
User (1) ─────────────→ (N) PollutionReport
     ↑                          ↓
     └──────────────────────────┘
   (as reporterId)    (as adminId)
```

---

## 7. API DOCUMENTATION

### 7.1. Authentication APIs

#### POST `/api/auth/register`
**Mô tả**: Đăng ký user mới

**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response** (201):
```json
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user"
  }
}
```

**Errors**:
- 400: Email/Username already exists
- 500: Server error

---

#### POST `/api/auth/login`
**Mô tả**: Đăng nhập

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** (200):
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user|admin"
  }
}
```

**Errors**:
- 401: Invalid credentials
- 500: Server error

---

#### GET `/api/auth/profile`
**Mô tả**: Lấy thông tin user hiện tại

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "createdAt": "date"
  }
}
```

**Errors**:
- 401: Unauthorized
- 404: User not found

---

### 7.2. Reports APIs

#### POST `/api/reports`
**Mô tả**: Tạo báo cáo mới

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "location": {
    "latitude": "number",
    "longitude": "number"
  },
  "pollutionType": "chemical|biological|physical|thermal|other",
  "severity": "low|medium|high|critical",
  "images": ["base64_string", ...]
}
```

**Response** (201):
```json
{
  "message": "Report created successfully",
  "report": {
    "id": "string",
    "title": "string",
    "description": "string",
    "location": {
      "type": "Point",
      "coordinates": [lng, lat]
    },
    "pollutionType": "string",
    "severity": "string",
    "status": "pending",
    "createdAt": "date"
  }
}
```

**Errors**:
- 401: Unauthorized
- 400: Invalid input
- 500: Server error

---

#### GET `/api/reports`
**Mô tả**: Lấy danh sách báo cáo

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): pending|in_progress|resolved|rejected
- `page` (optional): số trang (default: 1)
- `limit` (optional): số lượng/trang (default: 10)

**Response** (200):
```json
{
  "reports": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "location": {
        "type": "Point",
        "coordinates": [lng, lat]
      },
      "pollutionType": "string",
      "severity": "string",
      "status": "string",
      "reporterId": {
        "username": "string",
        "email": "string"
      },
      "adminId": {
        "username": "string",
        "email": "string"
      },
      "adminNotes": "string",
      "images": ["string"],
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalReports": 50
  }
}
```

**Notes**:
- User thường: chỉ thấy báo cáo của mình
- Admin: thấy tất cả báo cáo

---

#### GET `/api/reports/:id`
**Mô tả**: Lấy chi tiết một báo cáo

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "report": {
    "id": "string",
    "title": "string",
    "description": "string",
    "location": {
      "type": "Point",
      "coordinates": [lng, lat]
    },
    "pollutionType": "string",
    "severity": "string",
    "status": "string",
    "reporterId": {
      "username": "string",
      "email": "string"
    },
    "adminId": {
      "username": "string",
      "email": "string"
    },
    "adminNotes": "string",
    "images": ["string"],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Errors**:
- 401: Unauthorized
- 403: Access denied
- 404: Report not found
- 400: Invalid ID

---

#### PUT `/api/reports/:id/status`
**Mô tả**: Cập nhật trạng thái báo cáo (Admin only)

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "status": "pending|in_progress|resolved|rejected",
  "adminNotes": "string (optional)"
}
```

**Response** (200):
```json
{
  "message": "Report status updated successfully",
  "report": { ... }
}
```

**Errors**:
- 401: Unauthorized
- 403: Admin access required
- 404: Report not found
- 400: Invalid input

---

#### GET `/api/reports/nearby`
**Mô tả**: Tìm báo cáo gần vị trí

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `latitude` (required): vĩ độ
- `longitude` (required): kinh độ
- `radius` (optional): bán kính tìm kiếm (meters, default: 5000)
- `status` (optional): filter theo trạng thái

**Response** (200):
```json
{
  "reports": [
    { ... }
  ]
}
```

**Errors**:
- 401: Unauthorized
- 400: Missing latitude/longitude

---

## 8. HƯỚNG DẪN CÀI ĐẶT

### 8.1. Yêu cầu hệ thống

#### Phần mềm cần thiết:
- **Node.js**: v18 trở lên
- **Bun**: Latest version ([tải tại bun.sh](https://bun.sh))
- **MongoDB**: v5.0 trở lên
- **Git**: Để clone repository

#### Kiểm tra:
```bash
# Node.js
node --version  # v18+

# Bun
bun --version   # latest

# MongoDB
mongod --version  # v5.0+

# Git
git --version
```

### 8.2. Clone Repository

```bash
git clone https://github.com/your-username/water-pollution-gis.git
cd water-pollution-gis
```

### 8.3. Cài đặt Dependencies

```bash
# Root level (installs for all workspaces)
bun install
```

### 8.4. Cấu hình Environment

#### Mobile App (`.env`)
```bash
cd apps/mobile-app
cat > .env << EOF
VITE_API_URL=http://localhost:3002/api
EOF
```

#### Admin App (`.env`)
```bash
cd apps/admin-app
cat > .env << EOF
VITE_API_URL=http://localhost:3002/api
EOF
```

#### Backend (Environment Variables)
```bash
# Option 1: .env file (tạo trong thư mục backend/)
cd backend
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/water-pollution-gis
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3002
EOF

# Option 2: Export trong terminal (tạm thời)
export MONGODB_URI="mongodb://localhost:27017/water-pollution-gis"
export JWT_SECRET="your-super-secret-jwt-key"
export PORT=3002
```

### 8.5. Khởi động MongoDB

#### Option 1: Local MongoDB
```bash
# Start MongoDB service
mongod

# Hoặc nếu dùng systemd
sudo systemctl start mongodb
```

#### Option 2: Docker
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

#### Option 3: MongoDB Atlas (Cloud)
- Đăng ký tại [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Tạo cluster miễn phí
- Lấy connection string
- Cập nhật MONGODB_URI

### 8.6. Tạo Admin User

```bash
# Chạy script tạo admin
cd scripts
node create-admin.js

# Hoặc tạo thủ công qua MongoDB shell
mongosh
use water-pollution-gis
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10$...", // hash của password
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 8.7. Khởi động Ứng dụng

#### Option A: Chạy tất cả cùng lúc
```bash
# Từ root directory
bun run dev:all
```

#### Option B: Chạy riêng từng service

**Terminal 1 - Backend:**
```bash
cd backend
bun run dev
# API running at http://localhost:3002
```

**Terminal 2 - Mobile App:**
```bash
cd apps/mobile-app
bun run dev
# App running at http://localhost:3000
```

**Terminal 3 - Admin App:**
```bash
cd apps/admin-app
bun run dev
# Dashboard running at http://localhost:3001
```

### 8.8. Truy cập Ứng dụng

- **Mobile App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3002

### 8.9. Test APIs (Optional)

```bash
# Health check
curl http://localhost:3002/

# Register user
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 9. HƯỚNG DẪN SỬ DỤNG

### 9.1. Hướng dẫn cho Người dùng (Mobile App)

#### Bước 1: Đăng ký tài khoản
1. Mở http://localhost:3000
2. Click "Register here"
3. Điền:
   - Username
   - Email
   - Password
   - Confirm Password
4. Click "Đăng ký"
5. Tự động đăng nhập sau khi đăng ký thành công

#### Bước 2: Đăng nhập (nếu đã có tài khoản)
1. Nhập email và password
2. Click "Đăng nhập"

#### Bước 3: Xem danh sách báo cáo
1. Sau khi đăng nhập, hiển thị danh sách báo cáo
2. Sử dụng tabs để filter:
   - Tất cả
   - Chờ xử lý
   - Đang xử lý
   - Đã giải quyết
3. Click vào báo cáo để xem chi tiết

#### Bước 4: Tạo báo cáo mới
1. Click nút "➕ Tạo báo cáo mới"
2. Điền thông tin:
   - **Tiêu đề**: Mô tả ngắn gọn
   - **Mô tả**: Chi tiết về tình trạng ô nhiễm
   - **Chọn vị trí**:
     * **Option 1**: Click trên bản đồ
     * **Option 2**: Click "Sử dụng vị trí hiện tại"
     * **Option 3**: Nhập thủ công vĩ độ/kinh độ
   - **Loại ô nhiễm**: Chemical, Biological, Physical, Thermal, Other
   - **Mức độ**: Low, Medium, High, Critical
   - **Hình ảnh** (tùy chọn):
     * Click vào khu vực upload
     * Chọn tối đa 5 ảnh
     * Preview và xóa nếu cần
3. Click "Gửi báo cáo"
4. Chờ xác nhận thành công
5. Tự động quay về danh sách

#### Bước 5: Theo dõi trạng thái
1. Xem danh sách báo cáo
2. Kiểm tra badge trạng thái:
   - 🟡 Chờ xử lý: Admin chưa xem
   - 🔵 Đang xử lý: Admin đang xử lý
   - 🟢 Đã giải quyết: Hoàn thành
   - 🔴 Từ chối: Admin từ chối
3. Click vào báo cáo để xem ghi chú của admin (nếu có)

### 9.2. Hướng dẫn cho Admin (Admin Dashboard)

#### Bước 1: Đăng nhập Admin
1. Mở http://localhost:3001
2. Đăng nhập bằng tài khoản admin
   - Email: admin@example.com
   - Password: admin123
3. Redirect đến Dashboard

#### Bước 2: Xem Dashboard
1. **Overview Cards**:
   - Tổng số báo cáo
   - Chờ xử lý
   - Đang xử lý
   - Đã giải quyết
   - Từ chối
2. **Biểu đồ**:
   - Phân bố theo mức độ nghiêm trọng
   - Phân bố theo loại ô nhiễm
   - Xu hướng theo thời gian
3. Click "Xem tất cả báo cáo" hoặc "Xem bản đồ"

#### Bước 3: Quản lý báo cáo (Reports List)
1. Click "📋 Báo cáo" trong sidebar
2. **Tìm kiếm**: Nhập từ khóa vào search bar
3. **Filter**: Click vào tabs trạng thái
4. **Quick Actions** (từ danh sách):
   - "Bắt đầu xử lý": pending → in_progress
   - "Hoàn thành": in_progress → resolved
   - "Từ chối": pending/in_progress → rejected
5. Click icon ✏️ hoặc "Xem chi tiết" để mở ReportDetail

#### Bước 4: Xử lý báo cáo chi tiết
1. Click vào một báo cáo
2. **Xem thông tin**:
   - Đọc description đầy đủ
   - Xem hình ảnh (click để phòng to)
   - Check location coordinates
   - Xem thông tin người báo cáo
3. **Nhập ghi chú**:
   - Scroll đến "Ghi chú quản trị viên"
   - Nhập ghi chú nội bộ
   - Ghi chú sẽ được lưu khi update status
4. **Thay đổi trạng thái**:
   - Từ "Đã gửi yêu cầu":
     * Click "Bắt đầu xử lý" (xác nhận)
     * Hoặc "Từ chối báo cáo" (xác nhận)
   - Từ "Đang xử lý":
     * Click "Hoàn thành xử lý" (xác nhận)
     * Hoặc "Từ chối báo cáo" (xác nhận)
5. **Xác nhận**: Click "OK" trong popup confirm
6. **Kết quả**: 
   - Thành công: Trạng thái cập nhật, ghi chú được lưu
   - Thất bại: Alert thông báo lỗi

#### Bước 5: Xem bản đồ
1. Click "🗺️ Bản đồ" trong sidebar
2. **Xem markers**:
   - Mỗi báo cáo = 1 marker màu sắc theo severity
   - Click marker để xem popup
3. **Filter trên map**:
   - Click nút filter (Tất cả/Chờ xử lý/Đang xử lý/Đã xong/Từ chối)
   - Map tự động cập nhật markers
4. **Xem chi tiết**:
   - Click "Xem chi tiết" trong popup
   - Mở ReportDetail page

#### Bước 6: Đăng xuất
1. Click icon "🚪" hoặc "Đăng xuất" trong sidebar
2. Tự động redirect về Login page

---

## 10. CÁC TÍNH NĂNG ĐÃ TRIỂN KHAI

### 10.1. Authentication & Authorization ✅
- [x] Đăng ký user (với validate)
- [x] Đăng nhập (JWT tokens)
- [x] Lưu token trong localStorage
- [x] Auto-rehydrate session
- [x] Protected routes
- [x] Role-based access control (user/admin)
- [x] Logout functionality

### 10.2. User Features (Mobile App) ✅
- [x] View danh sách báo cáo của mình
- [x] Filter theo trạng thái
- [x] Tạo báo cáo mới với:
  - [x] Title + Description
  - [x] **Bản đồ tương tác để chọn vị trí**
  - [x] Get GPS location
  - [x] Nhập tọa độ thủ công
  - [x] **Sync 2 chiều map ↔ inputs**
  - [x] Chọn loại ô nhiễm
  - [x] Chọn mức độ nghiêm trọng
  - [x] Upload hình ảnh (base64, max 5 ảnh)
- [x] Xem chi tiết báo cáo
- [x] Xem trạng thái xử lý
- [x] Xem ghi chú admin (nếu có)

### 10.3. Admin Features ✅
- [x] Dashboard với statistics
  - [x] Overview cards
  - [x] Pie charts (severity, pollution type)
  - [x] Line chart (trends)
- [x] Quản lý tất cả báo cáo
  - [x] Search functionality
  - [x] Filter theo status (5 options)
  - [x] Quick actions từ list
  - [x] **Vietnamese status labels**
- [x] Chi tiết báo cáo
  - [x] Full information display
  - [x] **UI/UX cải tiến cho Admin Actions**
  - [x] **Ghi chú quản trị viên**
  - [x] **Popup xác nhận trước khi thay đổi status**
  - [x] Image gallery
- [x] Cập nhật trạng thái báo cáo
  - [x] pending → in_progress
  - [x] in_progress → resolved
  - [x] pending/in_progress → rejected
  - [x] **4 trạng thái**: pending, in_progress, resolved, rejected
  - [x] **Lưu admin notes cùng status update**
  - [x] **Lock status khi đã resolved/rejected**
- [x] **Bản đồ tương tác (Leaflet)**
  - [x] Hiển thị tất cả báo cáo
  - [x] Markers màu theo severity
  - [x] Popups với thông tin
  - [x] **Filter theo status trên map**
  - [x] **Vietnamese labels trong popups**
  - [x] Auto-center & Auto-zoom
  - [x] Legend & Report counter

### 10.4. Backend Features ✅
- [x] RESTful API with Hono
- [x] MongoDB + Mongoose
- [x] JWT authentication
- [x] Password hashing (bcryptjs)
- [x] **CORS configuration fixed**
- [x] Geospatial queries ($near)
- [x] Pagination support
- [x] Role-based authorization middleware
- [x] **Admin notes support**
- [x] **Optional status filter for nearby reports**
- [x] Input validation
- [x] Error handling

### 10.5. UI/UX Enhancements ✅
- [x] Responsive design (mobile + desktop)
- [x] Loading states
- [x] Error messages
- [x] Empty states
- [x] Confirmation dialogs
- [x] Toast notifications (implicit)
- [x] **Vietnamese translations cho status**
- [x] **Color-coded severity badges**
- [x] **Status badges với icons**
- [x] **Gradient backgrounds**
- [x] **Interactive maps với Leaflet**
- [x] **Image previews & galleries**

### 10.6. Map Features ✅

#### Admin Map View:
- [x] OpenStreetMap integration
- [x] Custom markers by severity
- [x] Click markers for popups
- [x] Filter controls (status)
- [x] Legend (severity colors)
- [x] Report counter
- [x] Auto-bounds fitting
- [x] Vietnamese labels

#### Mobile Create Report Map:
- [x] Interactive map (Leaflet)
- [x] Click to select location
- [x] Marker placement
- [x] GPS location button
- [x] Sync với input fields
- [x] **Center mặc định: Hà Nội**
- [x] Auto-center khi chọn vị trí

---

## 11. TROUBLESHOOTING

### 11.1. Lỗi thường gặp

#### 1. MongoDB Connection Failed
**Lỗi**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Nguyên nhân**:
- MongoDB chưa được start
- Connection string sai
- Port 27017 bị chiếm

**Giải pháp**:
```bash
# Kiểm tra MongoDB đang chạy
ps aux | grep mongod

# Start MongoDB
sudo systemctl start mongodb
# Hoặc
mongod

# Kiểm tra port
netstat -tuln | grep 27017

# Test connection
mongosh
```

---

#### 2. CORS Errors
**Lỗi**: `Access to fetch blocked by CORS policy`

**Nguyên nhân**:
- Frontend URL không match backend CORS config
- Headers không đúng

**Giải pháp**:
```typescript
// backend/index.ts - Đã fix
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

---

#### 3. 401 Unauthorized
**Lỗi**: `401 Unauthorized` khi call API

**Nguyên nhân**:
- Token không có trong request
- Token expired
- Token invalid

**Giải pháp**:
```typescript
// Check token trong localStorage
console.log(localStorage.getItem('token'));

// Set token trong Axios
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Re-login để lấy token mới
```

---

#### 4. Admin Access Denied
**Lỗi**: `403 Forbidden` khi truy cập admin features

**Nguyên nhân**:
- User role không phải 'admin'

**Giải pháp**:
```javascript
// Kiểm tra role trong MongoDB
mongosh
use water-pollution-gis
db.users.findOne({ email: "admin@example.com" })

// Update role thành admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

#### 5. Map không hiển thị
**Lỗi**: Bản đồ trống hoặc không load

**Nguyên nhân**:
- Leaflet CSS chưa được import
- Container height = 0
- Map chưa được invalidateSize

**Giải pháp**:
```typescript
// Import CSS
import 'leaflet/dist/leaflet.css';

// Set container height
<div ref={mapRef} style={{ height: '400px' }} />

// Invalidate size
useEffect(() => {
  if (mapInstance) {
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 100);
  }
}, [mapInstance]);
```

---

#### 6. Image Upload quá chậm
**Lỗi**: Upload ảnh mất nhiều thời gian

**Nguyên nhân**:
- File size quá lớn
- Convert to base64 chậm

**Giải pháp**:
```typescript
// Compress image trước khi upload
// Sử dụng library: browser-image-compression
import imageCompression from 'browser-image-compression';

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920
  };
  return await imageCompression(file, options);
};
```

---

#### 7. Port đã được sử dụng
**Lỗi**: `EADDRINUSE: address already in use`

**Nguyên nhân**:
- Port 3000/3001/3002 đang được process khác dùng

**Giải pháp**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Hoặc đổi port
# .env
PORT=3003
```

---

#### 8. Bun command not found
**Lỗi**: `bun: command not found`

**Nguyên nhân**:
- Bun chưa được cài đặt

**Giải pháp**:
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Hoặc với npm
npm install -g bun

# Verify
bun --version
```

---

### 11.2. Development Tips

1. **Clear Cache**:
```bash
# Clear Bun cache
bun pm cache rm

# Clear browser cache
# DevTools → Application → Clear storage
```

2. **Check Logs**:
```bash
# Backend logs
cd backend
bun run dev  # Xem console output

# Browser console
# F12 → Console tab
```

3. **MongoDB Debugging**:
```javascript
// Enable Mongoose debug mode
mongoose.set('debug', true);
```

4. **API Testing với cURL**:
```bash
# Health check
curl http://localhost:3002/

# Test với token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/api/reports
```

5. **React DevTools**:
- Install React DevTools extension
- Inspect component state & props
- Check context values

---

## 12. KẾ HOẠCH PHÁT TRIỂN TIẾP THEO

### 12.1. Tính năng mới (Planned)
- [ ] Email notifications cho user khi status thay đổi
- [ ] WebSocket cho real-time updates
- [ ] Export reports to PDF/Excel
- [ ] Advanced analytics dashboard
- [ ] Heatmap visualization
- [ ] User profile management
- [ ] Report comments/discussions
- [ ] Mobile app (React Native)
- [ ] PWA support (offline mode)
- [ ] Multi-language support
- [ ] Dark mode

### 12.2. Cải tiến kỹ thuật
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Redis caching
- [ ] Rate limiting
- [ ] File storage (S3/CloudFlare R2)
- [ ] Image optimization (CDN)
- [ ] Logging system (Winston)
- [ ] Monitoring (Prometheus + Grafana)

### 12.3. Security Enhancements
- [ ] Input sanitization
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting per user
- [ ] 2FA authentication
- [ ] OAuth2 integration (Google, Facebook)
- [ ] API key management
- [ ] Audit logs

---

## 13. ĐÓNG GÓP

### 13.1. Quy trình đóng góp
1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

### 13.2. Coding Standards
- **TypeScript**: Strict mode
- **ESLint**: Follow config
- **Prettier**: Auto-format
- **Naming**:
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case hoặc PascalCase

### 13.3. Commit Message Convention
```
<type>(<scope>): <subject>

Types:
- feat: Tính năng mới
- fix: Bug fix
- docs: Documentation
- style: Code style (formatting)
- refactor: Code refactoring
- test: Tests
- chore: Build, dependencies

Examples:
feat(admin): add status filter in map view
fix(mobile): map not centering on GPS location
docs: update API documentation
```

---

## 14. LICENSE

MIT License - Xem file LICENSE để biết chi tiết.

---

## 15. LIÊN HỆ & HỖ TRỢ

- **Repository**: [GitHub](https://github.com/your-username/water-pollution-gis)
- **Issues**: [GitHub Issues](https://github.com/your-username/water-pollution-gis/issues)
- **Email**: your-email@example.com

---

## 16. CREDITS

**Công nghệ sử dụng**:
- [Bun](https://bun.sh) - JavaScript runtime
- [Hono](https://hono.dev) - Web framework
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool
- [MongoDB](https://mongodb.com) - Database
- [Mongoose](https://mongoosejs.com) - ODM
- [Leaflet](https://leafletjs.com) - Maps library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide](https://lucide.dev) - Icons
- [Recharts](https://recharts.org) - Charts

**Được phát triển với ❤️ bởi [Your Name/Team]**

---

*Tài liệu này được tạo ngày: 2025-11-24*
*Version: 1.0.0*
