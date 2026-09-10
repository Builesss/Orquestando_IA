import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';
import { authService } from '../services/authService.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Acceso no autorizado. Token no proporcionado.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Token inválido o ausente.', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Buscar datos del usuario
    const user = await authService.getUserById(decoded.id);

    if (!user) {
      return errorResponse(res, 'El usuario asociado a este token ya no existe.', 401);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'La sesión ha expirado. Por favor inicia sesión nuevamente.', 401);
    }
    return errorResponse(res, 'Token inválido o sesión no autorizada.', 401);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await authService.getUserById(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch {
    // Si el token es inválido en modo opcional, continuamos como anónimo
    req.user = null;
  }
  next();
};
