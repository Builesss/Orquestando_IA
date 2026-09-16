import { conversationService } from '../services/conversationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const conversationController = {
  async getConversations(req, res, next) {
    try {
      const data = await conversationService.getConversations(req.user.id);
      return successResponse(res, data, 'Conversaciones obtenidas');
    } catch (error) {
      next(error);
    }
  },

  async startConversation(req, res, next) {
    try {
      const { otherUserId } = req.body;
      if (!otherUserId) return errorResponse(res, 'otherUserId es requerido', 400);

      const data = await conversationService.startConversation(req.user.id, otherUserId);
      return successResponse(res, data, 'Conversación iniciada');
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req, res, next) {
    try {
      const data = await conversationService.getMessages(req.params.id);
      return successResponse(res, data, 'Mensajes obtenidos');
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { text } = req.body;
      if (!text) return errorResponse(res, 'El texto del mensaje es requerido', 400);

      const data = await conversationService.sendMessage(req.params.id, req.user.id, text);
      return successResponse(res, data, 'Mensaje enviado');
    } catch (error) {
      next(error);
    }
  }
};
