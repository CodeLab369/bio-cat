import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthState } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CREDENTIALS = {
  username: 'Anahi',
  password: '2025',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    // Check if user is already logged in
    const savedAuth = storage.get<AuthState>(STORAGE_KEYS.AUTH);
    if (savedAuth?.isAuthenticated && savedAuth.user) {
      setAuthState(savedAuth);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user: { username: CREDENTIALS.username },
      };
      setAuthState(newAuthState);
      storage.set(STORAGE_KEYS.AUTH, newAuthState);
      return true;
    }
    return false;
  };

  const logout = () => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      user: null,
    };
    setAuthState(newAuthState);
    storage.remove(STORAGE_KEYS.AUTH);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
