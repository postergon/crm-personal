import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResumenDashboard from '../components/ResumenDashboard';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al CRM</h1>
      <p className="mb-6 text-gray-600">Selecciona una sección para continuar:</p>

      <ResumenDashboard />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/dashboard/contactos')}
          className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition"
        >
          Gestión de Contactos
        </button>

        <button
          onClick={() => navigate('/dashboard/ventas')}
          className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition"
        >
          Administración de Ventas
        </button>

        <button
          onClick={() => navigate('/dashboard/marketing')}
          className="bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition"
        >
          Automatización de Marketing
        </button>
<button
  onClick={() => navigate('/dashboard/historial')}
  className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition"
>
  Historial de Acciones
</button>
        <button
          onClick={() => navigate('/dashboard/analisis')}
          className="bg-amber-600 text-white px-6 py-4 rounded-lg hover:bg-amber-700 transition"
        >
          Análisis de Datos
        </button>

        <button
          onClick={() => navigate('/dashboard/soporte')}
          className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition"
        >
          Soporte al Cliente
        </button>
      </div>
    </div>
  );
};

export default Dashboard;