import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS, NotificationPayload } from '../events';
import logger from '../../utils/logger.util';

export const setupNotificationsHandlers = (io: Server, socket: Socket) => {
  logger.debug(`Notifications handler setup for socket: ${socket.id}`);
};

export const emitNotification = (
  io: Server,
  target: { organizationId?: string; userId?: string },
  notification: NotificationPayload
) => {
  if (target.userId) {
    io.to(`user:${target.userId}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
  } else if (target.organizationId) {
    io.to(`org:${target.organizationId}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
  }
};

export const emitMaintenanceAlert = (io: Server, organizationId: string, data: {
  type: 'created' | 'overdue' | 'completed';
  maintenanceId: string;
  equipmentName: string;
  description: string;
}) => {
  const eventMap = {
    created: SOCKET_EVENTS.MAINTENANCE_CREATED,
    overdue: SOCKET_EVENTS.MAINTENANCE_OVERDUE,
    completed: SOCKET_EVENTS.MAINTENANCE_COMPLETED,
  };

  io.to(`org:${organizationId}`).emit(eventMap[data.type], {
    ...data,
    timestamp: new Date(),
  });
};

export const emitIncidentAlert = (io: Server, organizationId: string, data: {
  type: 'created' | 'updated';
  incidentId: string;
  incidentNumber: string;
  severity: string;
  description: string;
}) => {
  const event = data.type === 'created' ? SOCKET_EVENTS.INCIDENT_CREATED : SOCKET_EVENTS.INCIDENT_UPDATED;
  io.to(`org:${organizationId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
};
