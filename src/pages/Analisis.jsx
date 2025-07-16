import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Analisis = () => {
  const [ventas, setVentas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [campañas, setCampañas] = useState([]);
  const [contactos, setContactos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const ventasSnap = await getDocs(collection(db, 'ventas'));
      setVentas(ventasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const tareasSnap = await getDocs(collection(db, 'tareas'));
      setTareas(tareasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const ticketsSnap = await getDocs(collection(db, 'tickets'));
      setTickets(ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const campañasSnap = await getDocs(collection(db, 'campañas'));
      setCampañas(campañasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const contactosSnap = await getDocs(collection(db, 'contactos'));
      setContactos(contactosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  // Ventas por mes
  const ventasPorMes = () => {
    const meses = {};
    ventas.forEach(v => {
      const fecha = v.fechaCreacion?.toDate?.() || new Date();
      const mes = fecha.toLocaleString('default', { month: 'short', year: 'numeric' });
      meses[mes] = (meses[mes] || 0) + (v.monto || 0);
    });
    return Object.entries(meses).map(([mes, total]) => ({ mes, total }));
  };

  // Tareas activas y vencidas
  const tareasActivas = tareas.filter(
    t => new Date(t.deadline) >= new Date() && t.estado !== 'Completada'
  );

  const tareasVencidas = tareas.filter(
    t => new Date(t.deadline) < new Date() && t.estado !== 'Completada'
  );

  // Tickets abiertos
  const ticketsAbiertos = tickets.filter(
    t => t.estado?.toLowerCase() !== 'cerrado'
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Panel de Análisis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card title="Ventas (30 días)" value={ventas.length} color="bg-green-500" />
        <Card title="Tareas activas" value={tareasActivas.length} color="bg-blue-500" />
        <Card title="Tickets abiertos" value={ticketsAbiertos.length} color="bg-red-500" />
        <Card title="Campañas enviadas" value={campañas.length} color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <h3 className="text-xl font-semibold mb-4">Ingresos mensuales</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ventasPorMes()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListBlock title="Tareas vencidas" items={tareasVencidas.map(t => t.titulo)} />
        <ListBlock title="Top contactos con campañas" items={topContactosCampañas(contactos, campañas)} />
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className={`rounded-xl text-white p-6 shadow-md ${color}`}>
    <h4 className="text-sm font-medium">{title}</h4>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const ListBlock = ({ title, items }) => (
  <div className="bg-white rounded-xl shadow p-4">
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
      {items.length > 0 ? items.map((item, idx) => <li key={idx}>{item}</li>) : <li>Sin datos</li>}
    </ul>
  </div>
);

const topContactosCampañas = (contactos, campañas) => {
  const conteo = {};
  campañas.forEach(c => {
    (c.contactos || []).forEach(id => {
      conteo[id] = (conteo[id] || 0) + 1;
    });
  });
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => {
      const c = contactos.find(c => c.id === id);
      return c ? `${c.nombre} (${conteo[id]})` : `ID: ${id}`;
    });
};

export default Analisis;