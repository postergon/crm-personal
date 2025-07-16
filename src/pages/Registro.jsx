import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      // Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar información adicional (rol) en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: user.email,
        rol: 'vendedor', // Puedes cambiar a 'admin' si lo deseas
      });

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Error de registro:", err);
  if (err.code === 'auth/email-already-in-use') {
    setError('Este correo ya está registrado.');
  } else if (err.code === 'auth/invalid-email') {
    setError('Correo inválido.');
  } else if (err.code === 'auth/weak-password') {
    setError('La contraseña debe tener al menos 6 caracteres.');
  } else {
    setError('Error al registrarse. Intenta de nuevo.');
    }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegistro} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Registro</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700"
        >
          Registrarse
        </button>
        <p
          onClick={() => navigate('/')}
          className="mt-4 text-center text-blue-600 hover:underline cursor-pointer"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </p>
      </form>
    </div>
  );
};

export default Registro;