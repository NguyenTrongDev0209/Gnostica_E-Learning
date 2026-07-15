import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';

const ProtectedRoute = ({ children, roles }) => {
  const currentUser = useAuthStore(state => state.user);
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const rawRole = currentUser.role || currentUser.roles?.[0] || "";
  const userRole = (typeof rawRole === 'object' ? rawRole.name : rawRole).toUpperCase();

  if (roles && Array.isArray(roles) && roles.length > 0) {
    const hasRole = roles.map(r => r.toUpperCase()).includes(userRole);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
};

export default ProtectedRoute;
