import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Obtener perfil de usuario público (con auth opcional para saber si lo sigo)
router.get('/:username', optionalAuth, userController.getUserProfile);

// Acciones sociales
router.post('/:id/follow', optionalAuth, userController.toggleFollow);
router.post('/:id/friend', optionalAuth, userController.toggleFriend);

export default router;
