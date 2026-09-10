import { config } from '../config/env.js';

export const mediaService = {
  /**
   * Formatear archivo subido y generar URL pública accesible
   */
  processUploadedFile(file, req) {
    if (!file) {
      throw new Error('No se recibió ningún archivo.');
    }

    const host = req.get('host') || `localhost:${config.port}`;
    const protocol = req.protocol || 'http';
    const publicUrl = `${protocol}://${host}/uploads/${file.filename}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      url: publicUrl
    };
  },

  /**
   * Procesar múltiples archivos subidos
   */
  processMultipleFiles(files, req) {
    if (!files || files.length === 0) {
      throw new Error('No se recibieron archivos.');
    }

    return files.map(file => this.processUploadedFile(file, req));
  }
};
