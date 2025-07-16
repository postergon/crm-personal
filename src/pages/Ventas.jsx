import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { serverTimestamp } from 'firebase/firestore';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [cliente, setCliente] = useState('');
  const [monto, setMonto] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [ventaEditandoId, setVentaEditandoId] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [orden, setOrden] = useState('asc');

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const ventasRef = collection(db, 'ventas');
  const historialRef = collection(db, 'historial');

  const registrarHistorial = async (descripcion, tipo, accion) => {
    await addDoc(historialRef, {
      descripcion,
      tipo,
      accion,
      timestamp: new Date()
    });
  };

  const obtenerVentas = async () => {
    const snapshot = await getDocs(ventasRef);
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setVentas(lista);
  };

  useEffect(() => {
    obtenerVentas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      cliente,
      monto: parseFloat(monto),
      estado
    };

    if (modoEdicion && ventaEditandoId) {
      await updateDoc(doc(db, 'ventas', ventaEditandoId), data);
      await registrarHistorial(`Venta actualizada para ${cliente}`, 'ventas', 'editar');
      setModoEdicion(false);
      setVentaEditandoId(null);
    } else {
  await addDoc(ventasRef, {
    ...data,
    fechaCreacion: serverTimestamp()
  });
  await registrarHistorial(`Nueva venta registrada para ${cliente}`, 'ventas', 'crear');
}

    setCliente('');
    setMonto('');
    setEstado('Pendiente');
    obtenerVentas();
  };

  const editarVenta = (venta) => {
    setCliente(venta.cliente);
    setMonto(venta.monto);
    setEstado(venta.estado);
    setModoEdicion(true);
    setVentaEditandoId(venta.id);
  };

  const eliminarVenta = async (id) => {
    const venta = ventas.find(v => v.id === id);
    await deleteDoc(doc(db, 'ventas', id));
    await registrarHistorial(`Venta eliminada para ${venta?.cliente || 'Cliente desconocido'}`, 'ventas', 'eliminar');
    obtenerVentas();
  };

  const ventasFiltradas = ventas
    .filter(v => 
      v.cliente.toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroEstado === 'Todos' || v.estado === filtroEstado)
    )
    .sort((a, b) => orden === 'asc' ? a.monto - b.monto : b.monto - a.monto);

  const totalPaginas = Math.ceil(ventasFiltradas.length / elementosPorPagina);
  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Ventas</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-md">
        <input
          type="text"
          placeholder="Cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Pagada">Pagada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700"
        >
          {modoEdicion ? 'Actualizar Venta' : 'Agregar Venta'}
        </button>
      </form>

      <div className="mt-8 space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />

        <select
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Pagada">Pagada</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="asc">Monto: Menor a mayor</option>
          <option value="desc">Monto: Mayor a menor</option>
        </select>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Lista de Ventas</h3>
        <ul className="space-y-2">
          {ventasPaginadas.map((venta) => (
            <li key={venta.id} className="bg-white p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <p className="font-bold">{venta.cliente}</p>
                <p className="text-sm text-gray-600">${venta.monto.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Estado: {venta.estado}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => editarVenta(venta)}
                  className="text-blue-500 font-bold hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarVenta(venta.id)}
                  className="text-red-500 font-bold hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ventas;
