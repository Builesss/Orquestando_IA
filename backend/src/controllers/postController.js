import { postService } from '../services/postService.js';
import { validatePost } from '../validators/postValidator.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const postController = {
  /**
   * GET /api/posts
   */
  async getPosts(req, res, next) {
    try {
      const { status = 'all', search = '', hashtag = '', page = 1, limit = 20 } = req.query;
      const currentUserId = req.user ? req.user.id : null;

      const result = await postService.getPosts({
        status,
        search,
        hashtag,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        userId: currentUserId
      });

      return successResponse(res, result, 'Publicaciones obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/posts/:id
   */
  async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.id : null;

      const post = await postService.getPostById(id, currentUserId);
      return successResponse(res, post, 'Publicación obtenida exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  },

  /**
   * POST /api/posts
   */
  async createPost(req, res, next) {
    try {
      const validation = validatePost(req.body);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const user = req.user;

      const newPost = await postService.createPost(user, validation.sanitized);
      return successResponse(res, newPost, 'Publicación creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/posts/:id
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const validation = validatePost(req.body, true);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const userId = req.user.id;
      const updatedPost = await postService.updatePost(id, userId, validation.sanitized);

      return successResponse(res, updatedPost, 'Publicación actualizada exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }
      if (error.message.includes('permiso')) {
        return errorResponse(res, error.message, 403);
      }
      next(error);
    }
  },

  /**
   * DELETE /api/posts/:id
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await postService.deletePost(id, userId);
      return successResponse(res, { id }, 'Publicación eliminada correctamente');
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }
      if (error.message.includes('permiso')) {
        return errorResponse(res, error.message, 403);
      }
      next(error);
    }
  },

  /**
   * POST /api/posts/:id/like
   */
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await postService.toggleLike(id, userId);
      return successResponse(res, result, result.isLiked ? 'Like agregado' : 'Like eliminado');
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  },

  /**
   * POST /api/posts/:id/duplicate
   */
  async duplicatePost(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const duplicated = await postService.duplicatePost(id, user);
      return successResponse(res, duplicated, 'Borrador duplicado exitosamente', 201);
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  },

  /**
   * POST /api/posts/:id/publish
   */
  async publishPost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const published = await postService.fastPublish(id, userId);
      return successResponse(res, published, 'Publicación lanzada exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }
      if (error.message.includes('permiso')) {
        return errorResponse(res, error.message, 403);
      }
      next(error);
    }
  }
};
