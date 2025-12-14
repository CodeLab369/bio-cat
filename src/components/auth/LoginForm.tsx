import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      addNotification('warning', 'Por favor, completa todos los campos');
      return;
    }

    const success = login(username, password);
    if (success) {
      addNotification('success', '¡Bienvenida de nuevo, Anahi!');
      navigate('/dashboard');
    } else {
      addNotification('error', 'Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-4">
            <svg className="w-12 h-12 text-white" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
              {/* Orejas */}
              <path d="M15 20 L20 8 L28 18" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
              <path d="M49 20 L44 8 L36 18" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
              {/* Cabeza */}
              <circle cx="32" cy="32" r="18" fill="currentColor" />
              {/* Ojos */}
              <ellipse cx="24" cy="28" rx="2.5" ry="4" fill="white" />
              <ellipse cx="40" cy="28" rx="2.5" ry="4" fill="white" />
              {/* Nariz */}
              <path d="M32 34 L29 38 L32 37 L35 38 Z" fill="white" />
              {/* Boca */}
              <path d="M32 37 Q28 40 25 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M32 37 Q36 40 39 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Bigotes */}
              <line x1="10" y1="30" x2="20" y2="29" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="34" x2="20" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="44" y1="29" x2="54" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="44" y1="34" x2="54" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">BIO - CAT</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Arena de Tofu Biodegradable para Gato</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            Iniciar Sesión
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 dark:from-primary-600 dark:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
