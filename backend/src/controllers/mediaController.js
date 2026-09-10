import { mediaService } from '../services/mediaService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const mediaController = {
  /**
   * POST /api/media/upload
   */
  async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Por favor selecciona una imagen para subir.', 400);
      }

      // Ahora es asíncrono
      const mediaData = await mediaService.processUploadedFile(req.file);
      return successResponse(res, mediaData, 'Imagen subida y procesada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/media/upload-multiple
   */
  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return errorResponse(res, 'Por favor selecciona al menos una imagen.', 400);
      }

      // Ahora es asíncrono
      const mediaList = await mediaService.processMultipleFiles(req.files);
      return successResponse(res, mediaList, 'Imágenes subidas y procesadas exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }
};
