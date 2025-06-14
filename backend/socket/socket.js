// socket/socket.js

const activeRooms = new Map(); // roomId -> Set of socketIds

export default function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    // Join Room
    socket.on('join-room', (roomId) => {
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set());
      }

      const usersInRoom = activeRooms.get(roomId);
      usersInRoom.add(socket.id);
      socket.join(roomId);

      console.log(`User ${socket.id} joined room ${roomId}`);

      // Inform others in room
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        roomUsers: Array.from(usersInRoom),
      });

      // Send existing users to the new user
      socket.emit('existing-users', {
        roomUsers: Array.from(usersInRoom).filter(id => id !== socket.id),
      });
    });

    // WebRTC Signaling
    socket.on('offer', ({ to, offer }) => {
      socket.to(to).emit('offer', { sender: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }) => {
      socket.to(to).emit('answer', { sender: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      socket.to(to).emit('ice-candidate', { sender: socket.id, candidate });
    });

    // Chat messaging
    socket.on('chat-message', ({ roomId, message }) => {
      const timestamp = new Date().toISOString();
      io.to(roomId).emit('chat-message', {
        message,
        sender: socket.id,
        timestamp,
      });
    });

    // Disconnection handling
    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);

      for (const [roomId, users] of activeRooms.entries()) {
        if (users.delete(socket.id)) {
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            roomUsers: Array.from(users),
          });

          if (users.size === 0) {
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} closed (no users)`);
          }
        }
      }
    });
  });
}
