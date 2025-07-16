import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  DollarSign,
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      const ventasSnap = await getDocs(collection(db, 'ventas'));
      setVentas(ventasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const soporteSnap = await getDocs(collection(db, 'soporte'));
      setTickets(soporteSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const obtenerRol = async (uid) => {
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      if (userDoc.exists()) {
        setRol(userDoc.data().rol);
      }
    };

    const init = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          obtenerRol(user.uid);
          obtenerDatos();
        }
      });
    };

    init();
  }, []);

  const puedeVer = (modulo) => {
    if (rol === 'admin') return true;
    if (rol === 'vendedor') return ['contactos', 'ventas'].includes(modulo);
    if (rol === 'soporte') return ['soporte'].includes(modulo);
    if (rol === 'marketing') return ['marketing'].includes(modulo);
    return false;
  };

  const ventasAbiertas = ventas.filter(v => v.estado === 'Pendiente').length;
  const ticketsPendientes = tickets.filter(t => t.estado === 'Pendiente').length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al CRM</h1>
      <p className="mb-6 text-gray-600">Resumen general y accesos:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <DollarSign className="text-green-600" size={32} />
          <div>
            <p className="text-sm text-gray-500">Ventas Abiertas</p>
            <p className="text-xl font-bold">{ventasAbiertas}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <AlertCircle className="text-purple-600" size={32} />
          <div>
            <p className="text-sm text-gray-500">Tickets Pendientes</p>
            <p className="text-xl font-bold">{ticketsPendientes}</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {puedeVer('contactos') && (
          <button
            onClick={() => navigate('/dashboard/contactos')}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition"
          >
            Gestión de Contactos
          </button>
        )}

        {puedeVer('ventas') && (
          <button
            onClick={() => navigate('/dashboard/ventas')}
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition"
          >
            Administración de Ventas
          </button>
        )}

        {puedeVer('marketing') && (
          <button
            onClick={() => navigate('/dashboard/marketing')}
            className="bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Automatización de Marketing
          </button>
        )}

        {rol === 'admin' && (
          <button
            onClick={() => navigate('/dashboard/historial')}
            className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition"
          >
            Historial de Acciones
          </button>
        )}

        {puedeVer('analisis') && (
          <button
            onClick={() => navigate('/dashboard/analisis')}
            className="bg-amber-600 text-white px-6 py-4 rounded-lg hover:bg-amber-700 transition"
          >
            Análisis de Datos
          </button>
        )}

        {puedeVer('soporte') && (
          <button
            onClick={() => navigate('/dashboard/soporte')}
            className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition"
          >
            Soporte al Cliente
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;