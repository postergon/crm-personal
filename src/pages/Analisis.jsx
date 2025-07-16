import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const Analisis = () => {
  const [registros, setRegistros] = useState([]);
  const [cliente, setCliente] = useState('');
  const [interacciones, setInteracciones] = useState('');
  const [nota, setNota] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const [ventas, setVentas] = useState([]);
  const [datosMensuales, setDatosMensuales] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState('Todos');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Pagada');
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  const analisisRef = collection(db, 'analisis');
  const ventasRef = collection(db, 'ventas');

  useEffect(() => {
    obtenerRegistros();
    obtenerVentas();
  }, []);

  useEffect(() => {
    generarGrafico();
  }, [ventas, anioSeleccionado, estadoSeleccionado]);

  const obtenerRegistros = async () => {
    const snapshot = await getDocs(analisisRef);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRegistros(lista);
  };

  const obtenerVentas = async () => {
    const snapshot = await getDocs(ventasRef);
    const lista = snapshot.docs.map(doc => doc.data()).filter(v => v.fechaCreacion);

    const anios = Array.from(
      new Set(lista.map(v => new Date(v.fechaCreacion).getFullYear()))
    );
    setAniosDisponibles(anios.sort());
    setVentas(lista);
  };

  const generarGrafico = () => {
    const agrupado = {};

    ventas
      .filter(v => estadoSeleccionado === 'Todos' || v.estado === estadoSeleccionado)
      .filter(v => {
        const año = new Date(v.fechaCreacion).getFullYear();
        return anioSeleccionado === 'Todos' || año.toString() === anioSeleccionado;
      })
      .forEach(v => {
        const fecha = new Date(v.fechaCreacion);
        const key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!agrupado[key]) agrupado[key] = 0;
        agrupado[key] += v.monto;
      });

    const datos = Object.entries(agrupado)
      .map(([mes, ingresos]) => ({ mes, ingresos }))
      .sort((a, b) => new Date(a.mes) - new Date(b.mes));

    setDatosMensuales(datos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datos = {
      cliente,
      interacciones: parseInt(interacciones),
      nota,
    };

    if (editandoId) {
      const docRef = doc(db, 'analisis', editandoId);
      await updateDoc(docRef, datos);
      setEditandoId(null);
    } else {
      await addDoc(analisisRef, datos);
    }

    setCliente('');
    setInteracciones('');
    setNota('');
    obtenerRegistros();
  };

  const editarRegistro = (item) => {
    setCliente(item.cliente);
    setInteracciones(item.interacciones);
    setNota(item.nota);
    setEditandoId(item.id);
  };

  const eliminarRegistro = async (id) => {
    const docRef = doc(db, 'analisis', id);
    await deleteDoc(docRef);
    obtenerRegistros();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Análisis de Datos del Cliente</h2>

      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-md mb-10"
      >
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <input
          type="number"
          placeholder="Cantidad de interacciones"
          value={interacciones}
          onChange={(e) => setInteracciones(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <textarea
          placeholder="Notas o comentarios"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-amber-600 text-white font-semibold py-2 rounded-lg hover:bg-amber-700"
        >
          {editandoId ? 'Actualizar Registro' : 'Agregar Registro'}
        </button>
      </form>

      {/* LISTADO DE REGISTROS */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">Registros de Clientes</h3>
        <ul className="space-y-2">
          {registros.map((item) => (
            <li
              key={item.id}
              className="bg-white p-4 rounded-md shadow flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{item.cliente}</p>
                <p className="text-sm text-gray-600">Interacciones: {item.interacciones}</p>
                <p className="text-sm text-gray-600">Notas: {item.nota}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => editarRegistro(item)}
                  className="text-blue-500 font-bold hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarRegistro(item.id)}
                  className="text-red-500 font-bold hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* GRAFICO INTERACTIVO */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h3 className="text-xl font-bold">Ingresos Mensuales</h3>

          <div className="flex gap-2">
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="Todos">Todos los años</option>
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>

            <select
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="Pagada">Pagadas</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Cancelada">Canceladas</option>
              <option value="Todos">Todos los estados</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosMensuales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
            <Bar dataKey="ingresos" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analisis;