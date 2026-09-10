import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupSecurityMiddleware } from './middleware/securityMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Capas de Seguridad Principales (Helmet, CORS)
setupSecurityMiddleware(app);


// 3. Parseo del cuerpo de peticiones con límites de tamaño para prevenir DoS
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 4. Logging de solicitudes entrantes
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// 5. Servir archivos estáticos subidos (imágenes)
const uploadDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// 6. Registro de Rutas API
app.use('/api', routes);

// 7. Manejo de Rutas no encontradas (404)
app.use(notFoundHandler);

// 8. Manejo centralizado de Errores
app.use(errorHandler);

export default app;
