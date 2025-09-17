import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Protected route for any authenticated user
export const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Protected route specifically for admin users
export const AdminRoute = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  return currentUser?.isAdmin ? <Outlet /> : <Navigate to={`/profile/${currentUser?.id || ''}`} />;
};