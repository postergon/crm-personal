import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const Soporte = () => {
  const [mensajes, setMensajes] = useState([]);
  const [cliente, setCliente] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [editandoId, setEditandoId] = useState(null);

  const soporteRef = collection(db, 'soporte');
  const historialRef = collection(db, 'historial');

  const obtenerMensajes = async () => {
    const snapshot = await getDocs(soporteRef);
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMensajes(lista);
  };

  useEffect(() => {
    obtenerMensajes();
  }, []);

  const registrarHistorial = async (tipo, accion, descripcion) => {
    await addDoc(historialRef, {
      tipo,
      accion,
      descripcion,
      timestamp: serverTimestamp()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datos = {
      cliente,
      mensaje,
      estado
    };

    if (editandoId) {
      await updateDoc(doc(db, 'soporte', editandoId), datos);
      await registrarHistorial(
        'soporte',
        'actualizar',
        `Se actualizó un ticket de soporte del cliente ${cliente} (estado: ${estado})`
      );
      setEditandoId(null);
    } else {
      await addDoc(soporteRef, datos);
      await registrarHistorial(
        'soporte',
        'crear',
        `Se creó un nuevo ticket de soporte para el cliente ${cliente} (estado: ${estado})`
      );
    }

    setCliente('');
    setMensaje('');
    setEstado('Pendiente');
    obtenerMensajes();
  };

  const editarMensaje = (item) => {
    setCliente(item.cliente);
    setMensaje(item.mensaje);
    setEstado(item.estado);
    setEditandoId(item.id);
  };

  const eliminarMensaje = async (id) => {
    const ticket = mensajes.find(m => m.id === id);
    await deleteDoc(doc(db, 'soporte', id));
    await registrarHistorial(
      'soporte',
      'eliminar',
      `Se eliminó el ticket de soporte del cliente ${ticket?.cliente || 'desconocido'}`
    );
    obtenerMensajes();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Soporte al Cliente</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-md">
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <textarea
          placeholder="Mensaje o problema"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Resuelto">Resuelto</option>
          <option value="Escalado">Escalado</option>
        </select>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700"
        >
          {editandoId ? 'Actualizar Ticket' : 'Agregar Ticket'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Tickets de Soporte</h3>
        <ul className="space-y-2">
          {mensajes.map(item => (
            <li key={item.id} className="bg-white p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <p className="font-bold">{item.cliente}</p>
                <p className="text-sm text-gray-600">{item.mensaje}</p>
                <p className="text-sm text-gray-600">Estado: {item.estado}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => editarMensaje(item)}
                  className="text-blue-500 font-bold hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarMensaje(item.id)}
                  className="text-red-500 font-bold hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Soporte;