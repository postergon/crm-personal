import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const Historial = () => {
  const [acciones, setAcciones] = useState([]);

  const obtenerHistorial = async () => {
    const historialRef = collection(db, 'historial');
    const q = query(historialRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const datos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setAcciones(datos);
  };

  useEffect(() => {
    obtenerHistorial();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Acciones</h2>

      {acciones.length === 0 ? (
        <p className="text-gray-600">No hay acciones registradas aún.</p>
      ) : (
        <ul className="space-y-3">
          {acciones.map((accion) => (
            <li key={accion.id} className="bg-white shadow p-4 rounded-md">
              <p className="text-sm text-gray-700">{accion.descripcion}</p>
              <p className="text-xs text-gray-500">
                Tipo: <span className="capitalize">{accion.tipo}</span> | 
                Acción: <span className="capitalize">{accion.accion}</span> | 
                Fecha: {accion.timestamp?.toDate().toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Historial;