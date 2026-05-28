import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-hint)' }}>加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
