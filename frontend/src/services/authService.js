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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
