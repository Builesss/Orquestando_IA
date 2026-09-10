import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoints del asistente IA con rate limiter específico y soporte opcional de usuario
router.post('/generate-caption', optionalAuth, aiController.generateCaption);
router.post('/suggest-hashtags', optionalAuth, aiController.suggestHashtags);
router.post('/improve-text', optionalAuth, aiController.improveText);

export default router;
