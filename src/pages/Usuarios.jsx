import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      const usuariosRef = collection(db, 'usuarios');
      const snapshot = await getDocs(usuariosRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(data);
    };

    obtenerUsuarios();
  }, []);

  const handleRolChange = async (id, nuevoRol) => {
    try {
      const usuarioRef = doc(db, 'usuarios', id);
      await updateDoc(usuarioRef, { rol: nuevoRol });

      setUsuarios(prev =>
        prev.map(user => (user.id === id ? { ...user, rol: nuevoRol } : user))
      );
    } catch (err) {
      console.error('Error al actualizar rol:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Correo</th>
            <th className="p-2 text-left">Rol</th>
            <th className="p-2 text-left">Cambiar Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id} className="border-t">
              <td className="p-2">{usuario.email}</td>
              <td className="p-2">{usuario.rol}</td>
              <td className="p-2">
                <select
                  value={usuario.rol}
                  onChange={(e) => handleRolChange(usuario.id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="admin">Admin</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="soporte">Soporte</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios;