import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.util';
import { setupTelemetryHandlers } from './handlers/telemetry.handler';
import { setupNotificationsHandlers } from './handlers/notifications.handler';

let io: Server;

export const setupWebSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-this-in-production') as {
        id: string;
        email: string;
        role: string;
        organizationId: string;
      };

      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`WebSocket connected: ${socket.id} (user: ${user?.email})`);

    // Auto-join organization room
    if (user?.organizationId) {
      socket.join(`org:${user.organizationId}`);
    }

    // Auto-join user room
    if (user?.id) {
      socket.join(`user:${user.id}`);
    }

    // Setup handlers
    setupTelemetryHandlers(io, socket);
    setupNotificationsHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket disconnected: ${socket.id} (reason: ${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`WebSocket error for ${socket.id}:`, error);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
};

export default setupWebSocket;
