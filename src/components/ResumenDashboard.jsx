import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Users, ClipboardCheck, ShoppingCart, AlertCircle } from 'lucide-react';

const ResumenDashboard = () => {
  const [resumen, setResumen] = useState({
    contactosConTareas: 0,
    totalTareas: 0,
    ventasAbiertas: 0,
    ticketsPendientes: 0,
  });

  const obtenerDatos = async () => {
    const contactosSnap = await getDocs(collection(db, 'contactos'));
    const ventasSnap = await getDocs(collection(db, 'ventas'));
    const ticketsSnap = await getDocs(collection(db, 'tickets'));

    let contactosConTareas = 0;
    let totalTareas = 0;

    contactosSnap.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.tareas)) {
        const pendientes = data.tareas.filter((t) => !t.completado);
        if (pendientes.length > 0) contactosConTareas++;
        totalTareas += pendientes.length;
      }
    });

    let ventasAbiertas = 0;
    ventasSnap.forEach((doc) => {
      if (doc.data().estado === 'abierta') ventasAbiertas++;
    });

    let ticketsPendientes = 0;
    ticketsSnap.forEach((doc) => {
      if (doc.data().estado !== 'cerrado') ticketsPendientes++;
    });

    setResumen({
      contactosConTareas,
      totalTareas,
      ventasAbiertas,
      ticketsPendientes,
    });
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const tarjeta = (color, icon, valor, texto) => (
    <div className={`bg-${color}-100 border-l-4 border-${color}-500 text-${color}-700 p-4 rounded-lg shadow`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xl font-bold">{valor}</p>
          <p className="text-sm">{texto}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {tarjeta('blue', <Users className="w-6 h-6" />, resumen.contactosConTareas, 'Contactos con tareas')}
      {tarjeta('green', <ClipboardCheck className="w-6 h-6" />, resumen.totalTareas, 'Tareas pendientes')}
      {tarjeta('amber', <ShoppingCart className="w-6 h-6" />, resumen.ventasAbiertas, 'Ventas abiertas')}
      {tarjeta('purple', <AlertCircle className="w-6 h-6" />, resumen.ticketsPendientes, 'Tickets sin resolver')}
    </div>
  );
};

export default ResumenDashboard;