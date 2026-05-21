import { io, type Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, '');

export type RealtimeNotification = {
  type: 'new_report' | 'report_status_updated';
  title: string;
  message: string;
  reportId: string;
  createdAt: string;
  data?: {
    status?: string;
    severity?: string;
    pollutionType?: string;
    adminNotes?: string;
  };
};

export function createSocket(token: string): Socket {
  return io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });
}
