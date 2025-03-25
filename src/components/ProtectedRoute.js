// real-o-ia-game/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Redirigir a la página de inicio si el usuario no está autenticado
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
