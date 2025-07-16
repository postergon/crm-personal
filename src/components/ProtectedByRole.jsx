import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedByRole = ({ allowedRoles, children }) => {
  const { rol, cargando } = useAuth();

  if (cargando) return <p className="text-center mt-10">Cargando...</p>;

  return allowedRoles.includes(rol)
    ? children
    : <Navigate to="/dashboard" />;
};

export default ProtectedByRole;