import { Router } from 'express';
import { mediaController } from '../controllers/mediaController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Subida de imagen individual (Protegida)
router.post('/upload', requireAuth, upload.single('media'), mediaController.uploadSingle);

// Subida de múltiples imágenes (carruseles) (Protegida)
router.post('/upload-multiple', requireAuth, upload.array('media', 5), mediaController.uploadMultiple);

export default router;
