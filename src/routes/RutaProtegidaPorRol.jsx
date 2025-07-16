import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RutaProtegidaPorRol = ({ children, rolesPermitidos }) => {
  const { rol, cargando } = useAuth();

  if (cargando) return <div className="p-6 text-gray-600">Cargando...</div>;

  if (!rolesPermitidos.includes(rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RutaProtegidaPorRol;