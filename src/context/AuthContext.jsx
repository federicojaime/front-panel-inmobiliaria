// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('inmobiliaria_user');
      const token = localStorage.getItem('inmobiliaria_token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else if (location.pathname !== '/login') {
        // Si no hay usuario/token y no estamos en login, redirigir
        navigate('/login');
      }
      setLoading(false);
    };

    initAuth();
  }, [navigate, location.pathname]);

  const handleAuthError = () => {
    setUser(null);
    localStorage.removeItem('inmobiliaria_token');
    localStorage.removeItem('inmobiliaria_user');
    navigate('/login');
  };

  useEffect(() => {
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.ok) {
        setUser(response.data);
        navigate('/');
        return { success: true };
      }
      
      toast.error(response.msg || 'Error al iniciar sesión');
      return { success: false, error: response.msg };
    } catch (error) {
      console.error('Error en login AuthContext:', error);
      toast.error('Error al iniciar sesión');
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};