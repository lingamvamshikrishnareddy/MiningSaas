import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import logger from '../../utils/logger.util';

export const setupTelemetryHandlers = (io: Server, socket: Socket) => {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (room: string) => {
    socket.join(room);
    logger.debug(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (room: string) => {
    socket.leave(room);
    logger.debug(`Socket ${socket.id} left room: ${room}`);
  });
};

export const emitTelemetryUpdate = (io: Server, equipmentId: string, data: any) => {
  io.to(`equipment:${equipmentId}`).emit(SOCKET_EVENTS.TELEMETRY_UPDATE, {
    equipmentId,
    data,
    timestamp: new Date(),
  });
};

export const emitTelemetryAlert = (io: Server, organizationId: string, alert: {
  equipmentId: string;
  equipmentName: string;
  warningCodes: string[];
  severity: 'low' | 'medium' | 'high';
}) => {
  io.to(`org:${organizationId}`).emit(SOCKET_EVENTS.TELEMETRY_ALERT, {
    ...alert,
    timestamp: new Date(),
  });
};

export const emitEquipmentStatusChange = (io: Server, organizationId: string, data: {
  equipmentId: string;
  previousStatus: string;
  newStatus: string;
}) => {
  io.to(`org:${organizationId}`).emit(SOCKET_EVENTS.EQUIPMENT_STATUS_CHANGE, {
    ...data,
    timestamp: new Date(),
  });
};
