import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader message="Verifying campus credentials..." fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to correct dashboard based on actual role
    const correctPath =
      user?.role === 'admin'
        ? '/admin'
        : user?.role === 'teacher'
        ? '/teacher'
        : '/student';
    return <Navigate to={correctPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
