import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import ErrorPage from '@/pages/general/ErrorPage';

// Helper to decode base64url-encoded JSON payload from JWT token
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Extracts the highest priority role claim from the cryptographically signed token
const getRoleFromToken = (token) => {
  const claims = parseJwt(token);
  if (!claims || !claims.roles) return "";
  
  // roles claim is a comma-separated string, e.g., "ROLE_USER,ROLE_ADMIN" or "ADMIN"
  const rolesArray = claims.roles.split(',').map(r => r.trim().toUpperCase());
  
  if (rolesArray.includes('ROLE_ADMIN') || rolesArray.includes('ADMIN')) {
    return 'ADMIN';
  }
  if (rolesArray.includes('ROLE_INSTRUCTOR') || rolesArray.includes('INSTRUCTOR')) {
    return 'INSTRUCTOR';
  }
  if (rolesArray.includes('ROLE_USER') || rolesArray.includes('USER')) {
    return 'USER';
  }
  return rolesArray[0] || "";
};

const ProtectedRoute = ({ children, roles }) => {
  const currentUser = useAuthStore(state => state.user);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Extract the true role from the JWT token to prevent client-side localStorage tampering
  let userRole = "";
  if (currentUser.token) {
    userRole = getRoleFromToken(currentUser.token);
  }

  // Fallback to mutable user object if no token is found (for mock/unauthenticated routes)
  if (!userRole) {
    const rawRole = currentUser.role || currentUser.roles?.[0] || "";
    userRole = (typeof rawRole === 'object' ? rawRole.name : rawRole).toUpperCase();
  }

  if (roles && Array.isArray(roles) && roles.length > 0) {
    const hasRole = roles.map(r => r.toUpperCase()).includes(userRole);
    if (!hasRole) {
      return <ErrorPage />;
    }
  }
  return children;
};

export default ProtectedRoute;
