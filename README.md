# Water Pollution GIS Reporting System

A comprehensive WebGIS system for reporting and managing water pollution incidents. Built with Turbo monorepo architecture using Bun runtime, featuring a React mobile app for users and an admin dashboard for management.

## 🌟 Features

### Mobile App (Port 3000)
- **User Authentication** - Secure login and registration system
- **Pollution Reporting** - Create detailed water pollution reports with:
  - Title and description
  - GPS location tracking
  - Pollution type (chemical, biological, physical, thermal, other)
  - Severity levels (low, medium, high, critical)
  - Image upload support (future enhancement)
- **Report Management** - View, filter, and track status of submitted reports
- **Mobile-Responsive Design** - Optimized for mobile devices

### Admin Dashboard (Port 3001)
- **Admin Authentication** - Secured admin-only access
- **Dashboard Overview** - Real-time statistics and metrics
- **Report Management** - Complete CRUD operations on all reports
- **Status Management** - Update report status (pending → in-progress → resolved/rejected)
- **Map View** - Geographic visualization of reports (placeholder for map integration)
- **Search & Filter** - Advanced filtering capabilities

### Backend API (Port 3002)
- **RESTful API** - Built with Hono framework and Bun runtime
- **Authentication** - JWT-based authentication with role-based access control
- **Database** - MongoDB with Mongoose ODM
- **Geospatial Queries** - Location-based search capabilities
- **Role-Based Access** - User and admin role management

## 🏗️ Architecture

```
water-pollution-gis/
├── apps/
│   ├── mobile-app/     # React mobile app (Port 3000)
│   └── admin-app/      # React admin dashboard (Port 3001)
├── backend/            # Hono + Bun API (Port 3002)
└── turbo.json         # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **Bun** (latest version)
- **MongoDB** (running locally or connection string)

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd water-pollution-gis

# Install dependencies for all packages
bun install
```

### 2. Environment Setup

Create `.env` files in each frontend app:

**Mobile App** (`apps/mobile-app/.env`):
```
VITE_API_URL=http://localhost:3002/api
```

**Admin App** (`apps/admin-app/.env`):
```
VITE_API_URL=http://localhost:3002/api
```

**Backend** (environment variables):
```bash
# Optional: MongoDB connection string
# Default: mongodb://localhost:27017/water-pollution-gis
export MONGODB_URI="mongodb://localhost:27017/water-pollution-gis"

# Optional: JWT secret
# Default: your-secret-key
export JWT_SECRET="your-super-secret-jwt-key"

# Optional: Server port
# Default: 3002
export PORT=3002
```

### 3. Database Setup

Start MongoDB or ensure it's running:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start local MongoDB service
mongod
```

### 4. Running the Application

#### Option A: Run All Services Simultaneously
```bash
# Run backend, mobile app, and admin app together
bun run dev:all
```

#### Option B: Run Services Individually

**Backend API:**
```bash
bun run dev:backend
# API runs on http://localhost:3002
```

**Mobile App:**
```bash
bun run dev:mobile
# App runs on http://localhost:3000
```

**Admin Dashboard:**
```bash
bun run dev:admin
# Dashboard runs on http://localhost:3001
```

### 5. Access the Applications

- **Mobile App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3002/api

## 📱 Usage Guide

### Mobile App Usage

1. **Register for an Account**
   - Visit http://localhost:3000
   - Click "Register here"
   - Fill in username, email, and password

2. **Create a Report**
   - After login, click "New Report"
   - Fill in report details
   - Use current location or enter coordinates manually
   - Submit the report

3. **Track Reports**
   - View all submitted reports in the main list
   - Filter by status (pending, in-progress, resolved)
   - Click on any report for details

### Admin Dashboard Usage

1. **Admin Login**
   - Visit http://localhost:3001
   - Use admin credentials (role must be 'admin' in database)
   - Register admin user if needed with role 'admin'

2. **Review Reports**
   - Dashboard shows overview statistics
   - Navigate to "Reports" section
   - Filter and search reports

3. **Manage Report Status**
   - Click on any report for details
   - Update status: pending → in-progress → resolved/rejected
   - Add admin notes for internal tracking

## 🛠️ Development

### Building for Production

```bash
# Build all applications
bun run build

# Build individual apps
cd apps/mobile-app && bun run build
cd apps/admin-app && bun run build
cd backend && bun run build
```

### Project Scripts

```bash
# Development
bun run dev              # Run all apps with Turbo
bun run dev:backend      # Backend only
bun run dev:mobile       # Mobile app only  
bun run dev:admin        # Admin dashboard only
bun run dev:all          # All services concurrently

# Production
bun run build            # Build all apps
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Reports
- `GET /api/reports` - Get all reports (with optional filtering)
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id/status` - Update report status (admin only)
- `GET /api/reports/nearby` - Get nearby reports

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,
  email: String, 
  password: String, // hashed
  role: String, // 'user' | 'admin'
  createdAt: Date,
  updatedAt: Date
}
```

### Pollution Report Model
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
  adminId: ObjectId, // optional
  adminNotes: String, // optional
  images: [String], // future enhancement
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables

**Backend Environment:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port

**Frontend Environment:**
- `VITE_API_URL` - Backend API URL

## 🚀 Future Enhancements

1. **Real Map Integration** - Replace placeholder map with actual Leaflet/Google Maps
2. **Image Upload** - Add photo upload for reports
3. **Real-time Notifications** - WebSocket integration for live updates
4. **Email Notifications** - Automated alerts for status changes
5. **Advanced Analytics** - More sophisticated reporting and metrics
6. **Mobile App PWA** - Progressive Web App capabilities
7. **Offline Support** - Service workers for offline reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running on port 27017
   - Check MONGODB_URI environment variable
   - Verify database exists and is accessible

2. **CORS Errors**
   - Check that API URLs match in frontend .env files
   - Ensure headers are set correctly in backend CORS configuration

3. **Authentication Issues**
   - Verify JWT_SECRET is set for backend
   - Check token storage in browser localStorage
   - Ensure user role is correct when accessing admin features

4. **Build Failures**
   - Run `bun install` in all packages
   - Check for TypeScript errors with `bunx tsc --noEmit`
   - Verify dependencies are compatible

### Development Tips

1. Use the monorepo scripts for convenience
2. Check browser console for detailed error messages
3. Use Postman/Insomnia for API testing
4. Check MongoDB Compass for database state
5. Review backend logs for API issues

---

Built with ❤️ using Bun, Hono, React, and MongoDB.
