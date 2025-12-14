import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">BIO - CAT</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Gestión de Inventario</p>
            </div>
          </div>

          {/* User and Theme Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-700 dark:text-neutral-300 hidden sm:block">
              Hola, {user?.username}
            </span>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
