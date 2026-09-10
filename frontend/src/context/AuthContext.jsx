// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  
  // Estado modal global de autenticación
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } else {
          // Usuario visitante no autenticado
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error('Error restaurando sesión:', e);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const openAuthModal = (message = 'Inicia sesión para continuar') => {
    setAuthPromptMessage(message);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage('');
  };

  // Helper para verificar autenticación antes de ejecutar una acción
  const requireAuth = (callback, message) => {
    if (!user || !token) {
      openAuthModal(message || 'Debes iniciar sesión para realizar esta acción');
      return false;
    }
    if (callback) callback();
    return true;
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    closeAuthModal();
    return data;
  };

  const register = async (username, email, password) => {
    const data = await authService.register(username, email, password);
    setUser(data.user);
    setToken(data.token);
    closeAuthModal();
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const result = await authService.updateProfile(updates);
    if (result?.user) {
      setUser(result.user);
    }
    if (result?.token) {
      setToken(result.token);
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        isAuthModalOpen,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
