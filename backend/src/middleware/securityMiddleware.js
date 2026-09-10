import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env.js';

export const setupSecurityMiddleware = (app) => {
  // Helmet HTTP headers protection
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config.isDev ? false : undefined
  }));

  // CORS configuration
  const allowedOrigins = [
    config.clientUrl,
    'https://orquestando-ia-sfbn.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (apps móviles, curl, postman) o desarrollo
      if (!origin || config.isDev) {
        return callback(null, true);
      }

      // Permitir si coincide exactamente con la lista o es un subdominio de Vercel
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`No permitido por CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
};
