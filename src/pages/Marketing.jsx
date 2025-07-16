import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';

const Marketing = () => {
  const [campañas, setCampañas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [canal, setCanal] = useState('Correo');
  const [editandoId, setEditandoId] = useState(null);

  const campañasRef = collection(db, 'campañas');

  const obtenerCampañas = async () => {
    const snapshot = await getDocs(campañasRef);
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCampañas(lista);
  };

  useEffect(() => {
    obtenerCampañas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editandoId) {
      const docRef = doc(db, 'campañas', editandoId);
      await updateDoc(docRef, { nombre, mensaje, canal });
      setEditandoId(null);
    } else {
      await addDoc(campañasRef, { nombre, mensaje, canal });
    }

    setNombre('');
    setMensaje('');
    setCanal('Correo');
    obtenerCampañas();
  };

  const editarCampaña = (item) => {
    setNombre(item.nombre);
    setMensaje(item.mensaje);
    setCanal(item.canal);
    setEditandoId(item.id);
  };

  const eliminarCampaña = async (id) => {
    const docRef = doc(db, 'campañas', id);
    await deleteDoc(docRef);
    obtenerCampañas();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Automatización de Marketing</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-md">
        <input
          type="text"
          placeholder="Nombre de la campaña"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <textarea
          placeholder="Mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="Correo">Correo</option>
          <option value="SMS">SMS</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700"
        >
          {editandoId ? 'Actualizar Campaña' : 'Agregar Campaña'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Campañas Activas</h3>
        <ul className="space-y-2">
          {campañas.map(item => (
            <li key={item.id} className="bg-white p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <p className="font-bold">{item.nombre}</p>
                <p className="text-sm text-gray-600">{item.mensaje}</p>
                <p className="text-sm text-gray-600">Canal: {item.canal}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => editarCampaña(item)}
                  className="text-blue-500 font-bold hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarCampaña(item.id)}
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

export default Marketing;