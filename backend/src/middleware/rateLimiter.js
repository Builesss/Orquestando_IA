import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/apiResponse.js';

// In-memory blacklist for repeatedly abusive IPs
const blockedIps = new Map(); // ip -> unblockTimestamp
const violationCounts = new Map(); // ip -> count

const BAN_DURATION_MS = 60 * 60 * 1000; // 1 hora de bloqueo
const MAX_VIOLATIONS_BEFORE_BAN = 5;

/**
 * Middleware para verificar si la IP está en la lista negra de bloqueo
 */
export const ipBlockerMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  if (blockedIps.has(ip)) {
    const unblockTime = blockedIps.get(ip);
    if (Date.now() < unblockTime) {
      const remainingMin = Math.ceil((unblockTime - Date.now()) / (60 * 1000));
      logger.warn(`Petición rechazada de IP bloqueada: ${ip}. Minutos restantes: ${remainingMin}`);
      return errorResponse(res, `Tu IP ha sido bloqueada temporalmente por exceso de peticiones. Intenta de nuevo en ${remainingMin} minutos.`, 403);
    } else {
      // El bloqueo expiró
      blockedIps.delete(ip);
      violationCounts.delete(ip);
      logger.info(`IP desbloqueada automáticamente: ${ip}`);
    }
  }

  next();
};

/**
 * Helper para registrar violación de rate limit e incrementar contador
 */
const recordViolation = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const currentCount = (violationCounts.get(ip) || 0) + 1;
  violationCounts.set(ip, currentCount);

  logger.warn(`Violación de Rate Limit por IP: ${ip} (Infracción ${currentCount}/${MAX_VIOLATIONS_BEFORE_BAN})`);

  if (currentCount >= MAX_VIOLATIONS_BEFORE_BAN) {
    blockedIps.set(ip, Date.now() + BAN_DURATION_MS);
    logger.error(`🚫 IP BLOQUEADA TEMPORALMENTE por abuso: ${ip} por 1 hora.`);
  }
};

/**
 * Rate Limiter Global para la API
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Límite de 200 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    recordViolation(req);
    return errorResponse(
      res,
      'Demasiadas peticiones desde esta dirección IP. Por favor intenta más tarde.',
      429
    );
  }
});

/**
 * Rate Limiter Estricto para Autenticación (Previene ataques de fuerza bruta)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Máximo 15 intentos de login/registro
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    recordViolation(req);
    return errorResponse(
      res,
      'Demasiados intentos de autenticación. Por favor espera 15 minutos antes de volver a intentar.',
      429
    );
  }
});

/**
 * Rate Limiter para llamadas a Inteligencia Artificial (Protege cuotas de OpenRouter)
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 40, // Máximo 40 peticiones a la IA
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    recordViolation(req);
    return errorResponse(
      res,
      'Has alcanzado el límite de solicitudes de IA por el momento. Por favor espera unos minutos.',
      429
    );
  }
});
