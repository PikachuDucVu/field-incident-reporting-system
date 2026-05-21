import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportsList from './pages/ReportsList';
import AdminLogin from './pages/AdminLogin';
import ReportDetail from './pages/ReportDetail';
import MapView from './pages/MapView';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" />;
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationProvider>
          <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout currentPage="/admin">
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute>
              <Layout currentPage="/admin/reports">
                <ReportsList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/:id" element={
            <ProtectedRoute>
              <Layout currentPage="/admin/reports">
                <ReportDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/map" element={
            <ProtectedRoute>
              <Layout currentPage="/admin/map">
                <MapView />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/admin/login" />} />
          </Routes>
        </NotificationProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
