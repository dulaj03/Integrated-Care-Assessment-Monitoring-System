const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // Store userId_role -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173', // Frontend
        'http://localhost:5174', // Admin panel
      ],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('register', ({ userId, role }) => {
      const key = `${userId}_${role}`;
      userSockets.set(key, socket.id);
      console.log(`👤 User registered: ${key} on socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Find and remove the socket from the map
      for (let [key, value] of userSockets.entries()) {
        if (value === socket.id) {
          userSockets.delete(key);
          console.log(`👋 User disconnected: ${key}`);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendToUser = (userId, role, event, data) => {
  if (!io) return;
  const key = `${userId}_${role}`;
  const socketId = userSockets.get(key);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = { initSocket, getIO, sendToUser };
