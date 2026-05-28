import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import PostDetailPage from '../pages/PostDetailPage';
import PostCreatePage from '../pages/PostCreatePage';
import PostEditPage from '../pages/PostEditPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileEditPage from '../pages/ProfileEditPage';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import InviteManage from '../pages/Admin/InviteManage';
import UserManage from '../pages/Admin/UserManage';
import PostManage from '../pages/Admin/PostManage';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import AdminRoute from '../components/Auth/AdminRoute';
import MainLayout from '../components/Layout/MainLayout';
import AdminLayout from '../components/Layout/AdminLayout';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <MainLayout />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/post/create', element: <PostCreatePage /> },
        { path: '/post/:id', element: <PostDetailPage /> },
        { path: '/post/:id/edit', element: <PostEditPage /> },
        { path: '/profile', element: <ProfilePage /> },
        { path: '/profile/edit', element: <ProfileEditPage /> },
      ],
    }],
  },
  {
    element: <AdminRoute />,
    children: [{
      element: <AdminLayout />,
      children: [
        { path: '/admin', element: <AdminDashboard /> },
        { path: '/admin/invite', element: <InviteManage /> },
        { path: '/admin/users', element: <UserManage /> },
        { path: '/admin/posts', element: <PostManage /> },
      ],
    }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
