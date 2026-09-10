import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Endpoints del asistente IA con rate limiter específico y soporte opcional de usuario
router.post('/generate-caption', aiRateLimiter, optionalAuth, aiController.generateCaption);
router.post('/suggest-hashtags', aiRateLimiter, optionalAuth, aiController.suggestHashtags);
router.post('/improve-text', aiRateLimiter, optionalAuth, aiController.improveText);

export default router;
