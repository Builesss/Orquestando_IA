import multer from 'multer';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error procesando solicitud [${req.method} ${req.url}]:`, err.message);

  // Manejo de errores de Multer (subida de archivos)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB.', 400);
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, 'Se ha superado el número máximo de archivos permitidos.', 400);
    }
    return errorResponse(res, `Error en la subida del archivo: ${err.message}`, 400);
  }

  // Errores de formato de archivo
  if (err.message && err.message.includes('Formato no compatible')) {
    return errorResponse(res, err.message, 400);
  }

  // Errores de sintaxis JSON en el cuerpo de la petición
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Formato JSON inválido en el cuerpo de la petición.', 400);
  }

  // Errores de CORS
  if (err.message && err.message.includes('CORS')) {
    return errorResponse(res, 'Acceso bloqueado por política de CORS.', 403);
  }

  // Error genérico del servidor
  const statusCode = err.statusCode || 500;
  const message = config.isDev ? err.message : 'Ha ocurrido un error interno en el servidor.';
  const details = config.isDev ? err.stack : null;

  return errorResponse(res, message, statusCode, details);
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404);
};
