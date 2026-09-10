/**
 * Utilidad para respuestas HTTP estandarizadas
 */
export const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
    timestamp: new Date().toISOString()
  });
};

export const errorResponse = (res, message = 'Error en el servidor', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: details || message,
    timestamp: new Date().toISOString()
  });
};
