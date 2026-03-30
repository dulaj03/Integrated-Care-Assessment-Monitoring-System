import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (userId: string, role: string) => {
  if (socket) return socket;

  socket = io('http://localhost:5000', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🔌 Connected to Socket.io server');
    socket?.emit('register', { userId, role });
  });

  socket.on('disconnect', () => {
    console.log('👋 Disconnected from Socket.io server');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
