import { userService } from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const userController = {
  /**
   * GET /api/users/:username
   */
  async getUserProfile(req, res, next) {
    try {
      const { username } = req.params;
      const currentUserId = req.user ? req.user.id : null;

      const profile = await userService.getUserProfile(username, currentUserId);
      return successResponse(res, profile, 'Perfil obtenido exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  },

  /**
   * POST /api/users/:id/follow
   */
  async toggleFollow(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.id : '11111111-1111-4111-a111-111111111111';

      const result = await userService.toggleFollow(id, currentUserId);
      return successResponse(res, result, result.following ? 'Usuario seguido' : 'Dejaste de seguir al usuario');
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return errorResponse(res, error.message, 404);
      }
      if (error.message.includes('ti mismo')) {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  },

  /**
   * POST /api/users/:id/friend
   */
  async toggleFriend(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.id : '11111111-1111-4111-a111-111111111111';

      const result = await userService.toggleFriend(id, currentUserId);
      
      let message = 'Solicitud de amistad procesada';
      if (result.friendStatus === 'accepted') message = 'Ahora son amigos';
      else if (result.friendStatus === false) message = 'Amistad eliminada';

      return successResponse(res, result, message);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return errorResponse(res, error.message, 404);
      }
      if (error.message.includes('ti mismo')) {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  }
};
