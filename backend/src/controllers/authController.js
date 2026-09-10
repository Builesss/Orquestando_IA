import { authService } from '../services/authService.js';
import { postService } from '../services/postService.js';
import { validateRegister, validateLogin, validateUpdateProfile } from '../validators/authValidator.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const validation = validateRegister(req.body);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const result = await authService.register(validation.sanitized);
      return successResponse(res, result, 'Usuario registrado exitosamente', 201);
    } catch (error) {
      if (error.message.includes('ya está')) {
        return errorResponse(res, error.message, 409);
      }
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const validation = validateLogin(req.body);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const result = await authService.login(validation.sanitized);
      return successResponse(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      if (error.message.includes('Credenciales')) {
        return errorResponse(res, error.message, 401);
      }
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const userProfile = await authService.getUserProfileWithStats(req.user.id, postService);
      return successResponse(res, userProfile, 'Perfil obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const validation = validateUpdateProfile(req.body);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const result = await authService.updateUserProfile(req.user.id, validation.sanitized);
      return successResponse(res, result, 'Perfil actualizado exitosamente');
    } catch (error) {
      if (error.message.includes('ya está en uso')) {
        return errorResponse(res, error.message, 409);
      }
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    return successResponse(res, null, 'Sesión cerrada correctamente');
  }
};
