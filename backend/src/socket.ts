import { Server } from 'socket.io';
import type { ServerType } from '@hono/node-server';
import { getUserFromToken } from './middleware/auth';

const SOCKET_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Đã gửi yêu cầu',
  in_progress: 'Đang xử lý',
  resolved: 'Đã xử lý xong',
  rejected: 'Từ chối'
};

type SocketUser = {
  id: string;
  role: 'user' | 'admin';
  username: string;
};

type ReportNotificationSource = {
  _id: unknown;
  title: string;
  status?: string;
  severity?: string;
  pollutionType?: string;
  adminNotes?: string;
  reporterId?: unknown;
  createdAt?: Date | string;
};

let io: Server | null = null;

export function initializeSocket(server: ServerType) {
  io = new Server(server as any, {
    cors: {
      origin: SOCKET_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (typeof token !== 'string' || !token) {
        next(new Error('Authentication required'));
        return;
      }

      const user = await getUserFromToken(token);
      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
        username: user.username
      } satisfies SocketUser;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;

    socket.join(`user:${user.id}`);

    if (user.role === 'admin') {
      socket.join('admins');
    }
  });
}

export function emitNewReportNotification(report: ReportNotificationSource) {
  io?.to('admins').emit('notification:new-report', {
    type: 'new_report',
    title: 'Phản ánh mới',
    message: `Có phản ánh mới: ${report.title}`,
    reportId: toId(report._id),
    createdAt: new Date().toISOString(),
    data: {
      status: report.status,
      severity: report.severity,
      pollutionType: report.pollutionType
    }
  });
}

export function emitReportStatusUpdatedNotification(report: ReportNotificationSource) {
  const reporterId = report.reporterId ? toId(report.reporterId) : null;

  if (!reporterId) {
    return;
  }

  const statusLabel = report.status ? STATUS_LABELS[report.status] || report.status : 'mới';

  io?.to(`user:${reporterId}`).emit('notification:report-status-updated', {
    type: 'report_status_updated',
    title: 'Trạng thái phản ánh đã thay đổi',
    message: `Phản ánh "${report.title}" đã chuyển sang trạng thái ${statusLabel}`,
    reportId: toId(report._id),
    createdAt: new Date().toISOString(),
    data: {
      status: report.status,
      adminNotes: report.adminNotes
    }
  });
}

function toId(value: unknown) {
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }

  return String(value);
}
