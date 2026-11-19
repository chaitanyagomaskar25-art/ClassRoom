import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

let ioInstance = null;

/**
 * Initializes Socket.IO with HTTP Server
 */
export function initSocketServer(httpServer) {
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

  ioInstance = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        callback(new Error('CORS origin rejected for Socket.IO'));
      },
      credentials: true
    }
  });

  // JWT Handshake Authentication Middleware
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const user = socket.user;
    if (!user) return;

    // Join strictly authorized rooms
    const userRoom = `user:${user.id}`;
    const roleRoom = `role:${String(user.role || '').toLowerCase()}`;
    socket.join(userRoom);
    socket.join(roleRoom);

    if (user.semester) {
      socket.join(`semester:${user.semester}`);
    }

    // Client can request to join an authorized subject room
    socket.on('join_subject_room', (subjectCode) => {
      if (typeof subjectCode === 'string' && subjectCode.trim()) {
        socket.join(`subject:${subjectCode.trim()}`);
      }
    });

    socket.on('leave_subject_room', (subjectCode) => {
      if (typeof subjectCode === 'string' && subjectCode.trim()) {
        socket.leave(`subject:${subjectCode.trim()}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean socket cleanup
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitToUser(userId, event, payload) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
}

export function emitToRole(role, event, payload) {
  if (ioInstance && role) {
    ioInstance.to(`role:${String(role).toLowerCase()}`).emit(event, payload);
  }
}

export function emitToSemester(semester, event, payload) {
  if (ioInstance && semester) {
    ioInstance.to(`semester:${semester}`).emit(event, payload);
  }
}

export function emitToAll(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}
