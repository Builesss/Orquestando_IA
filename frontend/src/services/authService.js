// src/services/authService.js
import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const resData = response.data;
      const data = resData?.data || resData;
      const token = data?.token || resData?.token;
      const user = data?.user || resData?.user || data;

      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return { user, token };
    } catch (error) {
      console.error('Error en /auth/login:', error?.response?.data || error.message);
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  async register(username, email, password) {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const resData = response.data;
      const data = resData?.data || resData;
      const token = data?.token || resData?.token;
      const user = data?.user || resData?.user || data;

      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return { user, token };
    } catch (error) {
      console.error('Error en /auth/register:', error?.response?.data || error.message);
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  async getMe() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await api.get('/auth/me');
      const resData = response.data;
      const user = resData?.data?.user || resData?.data || resData?.user || resData;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.warn('Error obteniendo datos de /auth/me:', error?.response?.data || error.message);
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    }
  },

  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/auth/profile', profileData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const resData = response.data;
      const data = resData?.data || resData;
      const updatedUser = data?.user || resData?.user || data;
      const newToken = data?.token || resData?.token || token;

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
