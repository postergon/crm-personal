import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { rol } = useAuth();

  if (!pathname.startsWith('/dashboard')) return null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
      <div className="flex gap-6">
        <Link to="/dashboard" className="hover:underline">Inicio</Link>
        <Link to="/dashboard/contactos" className="hover:underline">Contactos</Link>

        {/* Ventas solo para admin y vendedor */}
        {['admin', 'vendedor'].includes(rol) && (
          <Link to="/dashboard/ventas" className="hover:underline">Ventas</Link>
        )}

        {/* Soporte solo para admin y soporte */}
        {['admin', 'soporte'].includes(rol) && (
          <Link to="/dashboard/soporte" className="hover:underline">Soporte</Link>
        )}

        {/* Marketing solo para admin */}
        {rol === 'admin' && (
          <Link to="/dashboard/marketing" className="hover:underline">Marketing</Link>
        )}

        {/* Análisis solo para admin */}
        {rol === 'admin' && (
          <Link to="/dashboard/analisis" className="hover:underline">Análisis</Link>
        )}

        {/* Usuarios solo para admin */}
        {rol === 'admin' && (
          <Link to="/dashboard/usuarios" className="hover:underline">Usuarios</Link>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
      >
        Cerrar sesión
      </button>
    </nav>
  );
};

export default Navbar;