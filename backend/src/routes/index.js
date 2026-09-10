import { Router } from 'express';
import authRoutes from './authRoutes.js';
import postRoutes from './postRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import aiRoutes from './aiRoutes.js';
import { successResponse } from '../utils/apiResponse.js';
import { isSupabaseConfigured } from '../config/supabase.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'online',
    service: 'Orquestando_IA API Backend',
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured(),
    uptimeSeconds: Math.floor(process.uptime())
  }, 'API funcionando correctamente');
});

// Modular routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/media', mediaRoutes);
router.use('/ai', aiRoutes);

export default router;
