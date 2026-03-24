import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { tokens } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!tokens?.accessToken) return;

    const socket = io(WS_URL, {
      auth: { token: tokens.accessToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('notification', (data: any) => addNotification(data));
    socket.on('maintenance:overdue', (data: any) => {
      addNotification({
        type: 'warning',
        title: 'Overdue Maintenance',
        message: `${data.equipmentName}: ${data.description}`,
      });
    });
    socket.on('incident:created', (data: any) => {
      addNotification({
        type: 'error',
        title: 'New Incident Reported',
        message: `${data.incidentNumber}: ${data.severity} severity incident`,
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tokens?.accessToken, addNotification]);

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom: (room: string) => socketRef.current?.emit('join_room', room),
    leaveRoom: (room: string) => socketRef.current?.emit('leave_room', room),
  };
}
