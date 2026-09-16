import { Router } from 'express';
import { conversationController } from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de conversaciones requieren autenticación
router.use(requireAuth);

router.get('/', conversationController.getConversations);
router.post('/', conversationController.startConversation);
router.get('/:id/messages', conversationController.getMessages);
router.post('/:id/messages', conversationController.sendMessage);

export default router;
