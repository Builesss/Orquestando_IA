import { Router } from 'express';
import { postController } from '../controllers/postController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Feed y consulta de publicaciones (soporta usuario opcional para marcar likes personales)
router.get('/', optionalAuth, postController.getPosts);
router.get('/:id', optionalAuth, postController.getPostById);

// Creación, edición y eliminación de publicaciones
router.post('/', optionalAuth, postController.createPost);
router.put('/:id', optionalAuth, postController.updatePost);
router.delete('/:id', optionalAuth, postController.deletePost);

// Acciones especiales sobre publicaciones
router.post('/:id/like', optionalAuth, postController.toggleLike);
router.post('/:id/duplicate', optionalAuth, postController.duplicatePost);
router.post('/:id/publish', optionalAuth, postController.publishPost);

export default router;
