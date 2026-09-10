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
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or in allowedOrigins
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || config.isDev) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
};
