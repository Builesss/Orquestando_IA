import { Router } from 'express';
import { mediaController } from '../controllers/mediaController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Subida de imagen individual
router.post('/upload', upload.single('media'), mediaController.uploadSingle);

// Subida de múltiples imágenes (carruseles)
router.post('/upload-multiple', upload.array('media', 5), mediaController.uploadMultiple);

export default router;
