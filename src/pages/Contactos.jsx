import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';

const Contactos = () => {
  const [contactos, setContactos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [contactoEditandoId, setContactoEditandoId] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [fechaTarea, setFechaTarea] = useState('');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [soloTareasPendientes, setSoloTareasPendientes] = useState(false);
  const [soloConComentarios, setSoloConComentarios] = useState(false);

  const contactosRef = collection(db, 'contactos');
  const historialRef = collection(db, 'historial');

  const registrarAccion = async (accion, entidad, entidadId, detalle) => {
    await addDoc(historialRef, {
      accion,
      entidad,
      entidadId,
      detalle,
      timestamp: serverTimestamp()
    });
  };

  const obtenerContactos = async () => {
    const snapshot = await getDocs(contactosRef);
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setContactos(lista);
  };

  useEffect(() => {
    obtenerContactos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      nombre,
      email,
      telefono,
      comentarios: [],
      tareas: []
    };

    if (modoEdicion && contactoEditandoId) {
      const contactoDoc = doc(db, 'contactos', contactoEditandoId);
      await updateDoc(contactoDoc, data);
      await registrarAccion('actualizar', 'contacto', contactoEditandoId, `Actualizó contacto: ${nombre}`);
      setModoEdicion(false);
      setContactoEditandoId(null);
    } else {
      const docRef = await addDoc(contactosRef, data);
      await registrarAccion('crear', 'contacto', docRef.id, `Creó contacto: ${nombre}`);
    }

    setNombre('');
    setEmail('');
    setTelefono('');
    obtenerContactos();
  };

  const editarContacto = (contacto) => {
    setNombre(contacto.nombre);
    setEmail(contacto.email);
    setTelefono(contacto.telefono);
    setModoEdicion(true);
    setContactoEditandoId(contacto.id);
  };

  const eliminarContacto = async (id) => {
    const contactoDoc = doc(db, 'contactos', id);
    await deleteDoc(contactoDoc);
    await registrarAccion('eliminar', 'contacto', id, `Eliminó contacto con ID: ${id}`);
    obtenerContactos();
  };

  const agregarComentario = async (id, texto) => {
    if (!texto.trim()) return;
    const comentario = {
      texto,
      fecha: new Date().toISOString()
    };

    const contactoDoc = doc(db, 'contactos', id);
    await updateDoc(contactoDoc, {
      comentarios: arrayUnion(comentario)
    });

    await registrarAccion('comentar', 'contacto', id, `Agregó comentario: "${texto}"`);
    setNuevoComentario('');
    obtenerContactos();
  };

  const agregarTarea = async (id, descripcion) => {
    if (!descripcion.trim() || !fechaTarea) return;
    const tarea = {
      descripcion,
      completado: false,
      fecha: fechaTarea
    };

    const contactoDoc = doc(db, 'contactos', id);
    await updateDoc(contactoDoc, {
      tareas: arrayUnion(tarea)
    });

    await registrarAccion('agregar_tarea', 'contacto', id, `Agregó tarea: "${descripcion}"`);
    setNuevaTarea('');
    setFechaTarea('');
    obtenerContactos();
  };

  const marcarTareaComoCompleta = async (contactoId, tarea) => {
    const contactoDoc = doc(db, 'contactos', contactoId);
    await updateDoc(contactoDoc, {
      tareas: arrayRemove(tarea)
    });

    const tareaActualizada = { ...tarea, completado: true };
    await updateDoc(contactoDoc, {
      tareas: arrayUnion(tareaActualizada)
    });

    await registrarAccion('completar_tarea', 'contacto', contactoId, `Completó tarea: "${tarea.descripcion}"`);
    obtenerContactos();
  };

  const eliminarTarea = async (contactoId, tarea) => {
    const contactoDoc = doc(db, 'contactos', contactoId);
    await updateDoc(contactoDoc, {
      tareas: arrayRemove(tarea)
    });

    await registrarAccion('eliminar_tarea', 'contacto', contactoId, `Eliminó tarea: "${tarea.descripcion}"`);
    obtenerContactos();
  };

  const contactosFiltrados = contactos.filter(c => {
    const coincideTexto =
      c.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.email.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.telefono.includes(filtroTexto);

    const tieneComentarios = soloConComentarios ? (c.comentarios?.length > 0) : true;

    const tieneTareasPendientes = soloTareasPendientes
      ? c.tareas?.some(t => !t.completado)
      : true;

    return coincideTexto && tieneComentarios && tieneTareasPendientes;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Contactos</h2>

      <div className="bg-white p-4 rounded shadow-md mb-6 space-y-2 max-w-xl">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o teléfono"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={soloTareasPendientes}
            onChange={(e) => setSoloTareasPendientes(e.target.checked)}
          />
          Solo con tareas pendientes
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={soloConComentarios}
            onChange={(e) => setSoloConComentarios(e.target.checked)}
          />
          Solo con comentarios
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-md">
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md" required />
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md" required />
        <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md" required />
        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700">
          {modoEdicion ? 'Actualizar Contacto' : 'Agregar Contacto'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Lista de Contactos</h3>
        <ul className="space-y-4">
          {contactosFiltrados.map(contacto => (
            <li key={contacto.id} className="bg-white p-4 rounded-md shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{contacto.nombre}</p>
                  <p className="text-sm text-gray-600">{contacto.email}</p>
                  <p className="text-sm text-gray-600">{contacto.telefono}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => editarContacto(contacto)} className="text-blue-500 font-bold hover:underline">Editar</button>
                  <button onClick={() => eliminarContacto(contacto.id)} className="text-red-500 font-bold hover:underline">Eliminar</button>
                </div>
              </div>

              {contacto.comentarios?.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-sm">Historial:</p>
                  <ul className="ml-4 list-disc text-sm text-gray-700 mt-1">
                    {contacto.comentarios.map((coment, idx) => (
                      <li key={idx}>
                        {coment.texto}{' '}
                        <span className="text-xs text-gray-400">
                          ({new Date(coment.fecha).toLocaleString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  agregarComentario(contacto.id, nuevoComentario);
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Nuevo comentario"
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="flex-1 border border-gray-300 px-2 py-1 rounded-md text-sm"
                />
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700">Agregar</button>
              </form>

              {contacto.tareas?.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-sm">Tareas:</p>
                  <ul className="ml-4 text-sm text-gray-700 mt-1 space-y-1">
                    {contacto.tareas.map((tarea, idx) => {
                      const esVencida = !tarea.completado && new Date(tarea.fecha) < new Date();
                      return (
                        <li key={idx} className="flex items-center justify-between">
                          <span
                            className={`${
                              tarea.completado
                                ? 'line-through text-gray-400'
                                : esVencida
                                ? 'text-red-500 font-semibold'
                                : ''
                            }`}
                          >
                            {tarea.descripcion}{' '}
                            <span className="text-xs text-gray-500">
                              ({new Date(tarea.fecha).toLocaleString()})
                            </span>
                            {esVencida && !tarea.completado && (
                              <span className="ml-2 text-xs text-red-500">⚠ Vencida</span>
                            )}
                          </span>
                          <div className="flex gap-2">
                            {!tarea.completado && (
                              <button
                                onClick={() => marcarTareaComoCompleta(contacto.id, tarea)}
                                className="text-green-600 text-xs hover:underline"
                              >
                                Completar
                              </button>
                            )}
                            <button
                              onClick={() => eliminarTarea(contacto.id, tarea)}
                              className="text-red-500 text-xs hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  agregarTarea(contacto.id, nuevaTarea);
                }}
                className="mt-3 flex gap-2 items-center"
              >
                <input
                  type="text"
                  placeholder="Nueva tarea"
                  value={nuevaTarea}
                  onChange={(e) => setNuevaTarea(e.target.value)}
                  className="flex-1 border border-gray-300 px-2 py-1 rounded-md text-sm"
                />
                <input
                  type="datetime-local"
                  value={fechaTarea}
                  onChange={(e) => setFechaTarea(e.target.value)}
                  className="border border-gray-300 px-2 py-1 rounded-md text-sm"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                >
                  Agregar
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Contactos;

