// src/services/authService.js
import api from './api';
import { INITIAL_USER } from './mockData';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.warn('API offline o error en login, usando sesión simulada:', error.message);
      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockUser = { ...INITIAL_USER, email };
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { user: mockUser, token: mockToken };
    }
  },

  async register(username, email, password) {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.warn('API offline o error en register, usando sesión simulada:', error.message);
      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockUser = { ...INITIAL_USER, username, email };
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { user: mockUser, token: mockToken };
    }
  },

  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : INITIAL_USER;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      const data = response.data?.data || response.data;
      const updatedUser = data?.user || data;
      const newToken = data?.token || response.data?.token;

      if (newToken) {
        localStorage.setItem('token', newToken);
      }
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return { user: updatedUser, token: newToken };
    } catch (error) {
      console.error('Error al actualizar perfil en /api/auth/profile:', error?.response?.data || error.message);
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
