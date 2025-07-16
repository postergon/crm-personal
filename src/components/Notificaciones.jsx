import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const { usuario } = useAuth();

  useEffect(() => {
    const verificarTareasPendientes = async () => {
      if (!usuario) return;

      const contactosSnapshot = await getDocs(collection(db, 'contactos'));
      const hoy = new Date().toISOString().split('T')[0];
      const pendientes = [];

      contactosSnapshot.forEach(docSnap => {
        const datos = docSnap.data();
        if (datos.tareas && Array.isArray(datos.tareas)) {
          datos.tareas.forEach(tarea => {
            if (!tarea.completada && tarea.fecha === hoy) {
              pendientes.push({
                contacto: datos.nombre,
                tarea: tarea.texto
              });
            }
          });
        }
      });

      setNotificaciones(pendientes);
    };

    verificarTareasPendientes();
  }, [usuario]);

  if (notificaciones.length === 0) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
      <h3 className="font-bold mb-2">🔔 Tareas pendientes para hoy:</h3>
      <ul className="list-disc list-inside text-sm">
        {notificaciones.map((n, idx) => (
          <li key={idx}>
            <span className="font-semibold">{n.contacto}:</span> {n.tarea}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notificaciones;