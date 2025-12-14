import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Toast from './components/common/Toast';

function App() {
  return (
    <BrowserRouter basename="/biocat">
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Toast />
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventario"
                element={
                  <ProtectedRoute>
                    <Inventario />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute>
                    <Clientes />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
