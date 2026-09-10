import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`🚀 Servidor backend de Orquestando_IA iniciado en el puerto ${config.port}`);
  logger.info(`🌐 URL Base de la API: http://localhost:${config.port}/api`);
  logger.info(`🔒 Modo: ${config.nodeEnv} | CORS habilitado para: ${config.clientUrl}`);
});

// Manejo de apagado elegante (Graceful Shutdown)
const handleShutdown = (signal) => {
  logger.info(`Recibida señal ${signal}. Cerrando servidor de forma segura...`);
  server.close(() => {
    logger.info('Servidor HTTP cerrado exitosamente.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
