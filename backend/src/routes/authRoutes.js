import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rutas públicas de autenticación con rate limiting estricto anti-fuerza bruta
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);

// Rutas protegidas
router.get('/me', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/logout', authController.logout);

export default router;
