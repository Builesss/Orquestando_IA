import { aiService } from '../services/aiService.js';
import { authService } from '../services/authService.js';
import { validateGenerateCaption, validateSuggestHashtags, validateImproveText } from '../validators/aiValidator.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const aiController = {
  /**
   * POST /api/ai/generate-caption
   */
  async generateCaption(req, res, next) {
    try {
      const validation = validateGenerateCaption(req.body);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const result = await aiService.generateCaption(validation.sanitized);

      // Si el usuario está autenticado, incrementamos su contador de uso de IA
      if (req.user && req.user.id) {
        await authService.incrementAiUsage(req.user.id);
      }

      return successResponse(res, result, 'Caption generado exitosamente por IA');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/suggest-hashtags
   */
  async suggestHashtags(req, res, next) {
    try {
      const validation = validateSuggestHashtags(req.body);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const result = await aiService.suggestHashtags(validation.sanitized);

      if (req.user && req.user.id) {
        await authService.incrementAiUsage(req.user.id);
      }

      return successResponse(res, result, 'Hashtags sugeridos exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/improve-text
   */
  async improveText(req, res, next) {
    try {
      const validation = validateImproveText(req.body);
      if (!validation.isValid) {
        return errorResponse(res, validation.errors.join(' '), 400, validation.errors);
      }

      const result = await aiService.improveText(validation.sanitized);

      if (req.user && req.user.id) {
        await authService.incrementAiUsage(req.user.id);
      }

      return successResponse(res, result, 'Texto optimizado y pulido exitosamente');
    } catch (error) {
      next(error);
    }
  }
};
