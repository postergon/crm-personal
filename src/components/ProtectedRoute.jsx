import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p className="text-center mt-10">Cargando...</p>;

  return usuario ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
