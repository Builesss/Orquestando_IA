import { Router } from 'express';
import { postController } from '../controllers/postController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Feed y consulta de publicaciones (soporta usuario opcional para marcar likes personales)
router.get('/', optionalAuth, postController.getPosts);
router.get('/:id', optionalAuth, postController.getPostById);

// Creación, edición y eliminación de publicaciones (Protegidas)
router.post('/', requireAuth, postController.createPost);
router.put('/:id', requireAuth, postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

// Acciones especiales sobre publicaciones (Protegidas)
router.post('/:id/like', requireAuth, postController.toggleLike);
router.post('/:id/duplicate', requireAuth, postController.duplicatePost);
router.post('/:id/publish', requireAuth, postController.publishPost);

export default router;
