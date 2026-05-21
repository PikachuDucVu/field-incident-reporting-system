import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportList from './pages/ReportList';
import CreateReport from './pages/CreateReport';
import ReportDetail from './pages/ReportDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/reports" />} />
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportList />
              </ProtectedRoute>
            } />
            <Route path="/reports/new" element={
              <ProtectedRoute>
                <CreateReport />
              </ProtectedRoute>
            } />
            <Route path="/reports/:id" element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            } key="reports-detail" />
          </Routes>
          </div>
        </NotificationProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
