// utils/registrarAccion.js
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const registrarAccion = async ({ tipo, accion, descripcion }) => {
  try {
    const historialRef = collection(db, 'historial');
    await addDoc(historialRef, {
      tipo,             // Ej: 'contacto', 'venta', 'soporte'
      accion,           // Ej: 'crear', 'editar', 'eliminar'
      descripcion,      // Ej: 'Se eliminó el contacto Juan Pérez'
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error registrando acción:', error);
  }
};