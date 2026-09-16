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
   * GET /api/users/me/following
   * Obtiene la lista de usuarios que sigue el usuario autenticado
   */
  async getFollowing() {
    try {
      const response = await api.get('/users/me/following');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.warn('Error obteniendo seguidos:', error.message);
      return [];
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
      throw error;
    }
  },

  /**
   * POST /api/users/:id/friend
   */
  async toggleFriend(userId) {
    try {
      const response = await api.post(`/users/${userId}/friend`);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Error al alternar amistad:', error.message);
      throw error;
    }
  },

  /**
   * GET /api/conversations
   */
  async getConversations() {
    try {
      const response = await api.get('/conversations');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.warn('Error obteniendo conversaciones:', error.message);
      return [];
    }
  },

  /**
   * POST /api/conversations
   */
  async startConversation(otherUserId) {
    try {
      const response = await api.post('/conversations', { otherUserId });
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Error iniciando conversación:', error.message);
      throw error;
    }
  },

  /**
   * GET /api/conversations/:id/messages
   */
  async getMessages(conversationId) {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.warn('Error obteniendo mensajes:', error.message);
      return [];
    }
  },

  /**
   * POST /api/conversations/:id/messages
   */
  async sendMessage(conversationId, text) {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { text });
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Error enviando mensaje:', error.message);
      throw error;
    }
  }
};
