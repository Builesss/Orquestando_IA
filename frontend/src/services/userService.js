// src/services/userService.js
import api from './api';

export const userService = {
  /**
   * GET /api/users/:username
   * Obtiene el perfil público de un usuario con sus conteos de relaciones
   */
  async getUserProfile(username) {
    try {
      const response = await api.get(`/users/${username}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Error obteniendo perfil de usuario:', error.message);
      return null;
    }
  },

  /**
   * POST /api/users/:id/follow
   * Sigue o deja de seguir a un usuario (toggle)
   */
  async toggleFollow(userId) {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Error al alternar seguimiento:', error.message);
      // Fallback: devolver un estado local optimista
      throw error;
    }
  },

  /**
   * POST /api/users/:id/friend
   * Envía, acepta o cancela una solicitud de amistad (toggle)
   */
  async toggleFriend(userId) {
    try {
      const response = await api.post(`/users/${userId}/friend`);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Error al alternar amistad:', error.message);
      throw error;
    }
  }
};
