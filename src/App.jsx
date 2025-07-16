import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Contactos from './pages/Contactos';
import Ventas from './pages/Ventas';
import Soporte from './pages/Soporte';
import Marketing from './pages/Marketing';
import Analisis from './pages/Analisis';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedByRole from './components/ProtectedByRole';
import Usuarios from './pages/Usuarios';
import RutaProtegidaPorRol from './routes/RutaProtegidaPorRol';
import Historial from './pages/Historial';

const App = () => {
  console.log("App.jsx cargado");
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/contactos"
          element={
            <ProtectedRoute>
              <Navbar />
              <Contactos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ventas"
          element={
            <ProtectedRoute>
              <ProtectedByRole allowedRoles={['admin', 'vendedor']}>
                <Navbar />
                <Ventas />
              </ProtectedByRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/soporte"
          element={
            <ProtectedRoute>
              <ProtectedByRole allowedRoles={['admin', 'soporte']}>
                <Navbar />
                <Soporte />
              </ProtectedByRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/marketing"
          element={
            <ProtectedRoute>
              <ProtectedByRole allowedRoles={['admin']}>
                <Navbar />
                <Marketing />
              </ProtectedByRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analisis"
          element={
            <ProtectedRoute>
              <ProtectedByRole allowedRoles={['admin']}>
                <Navbar />
                <Analisis />
              </ProtectedByRole>
            </ProtectedRoute>
          }
        />
        <Route
  path="/dashboard/ventas"
  element={
    <RutaProtegidaPorRol rolesPermitidos={['admin', 'vendedor']}>
      <Ventas />
    </RutaProtegidaPorRol>
  }
/>
<Route path="/dashboard/historial" element={<Historial />} />
<Route
  path="/dashboard/marketing"
  element={
    <RutaProtegidaPorRol rolesPermitidos={['admin']}>
      <Marketing />
    </RutaProtegidaPorRol>
  }
/>

<Route
  path="/dashboard/soporte"
  element={
    <RutaProtegidaPorRol rolesPermitidos={['admin', 'soporte']}>
      <Soporte />
    </RutaProtegidaPorRol>
  }
/>

<Route
  path="/dashboard/analisis"
  element={
    <RutaProtegidaPorRol rolesPermitidos={['admin']}>
      <Analisis />
    </RutaProtegidaPorRol>
  }
/>
        <Route
  path="/dashboard/usuarios"
  element={
    <ProtectedRoute>
      <ProtectedByRole allowedRoles={['admin']}>
        <Navbar />
        <Usuarios />
      </ProtectedByRole>
    </ProtectedRoute>
  }
/>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;