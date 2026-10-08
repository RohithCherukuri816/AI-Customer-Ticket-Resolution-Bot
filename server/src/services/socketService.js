let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for a specific ticket conversation
    socket.on('join_ticket', (ticketId) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`[Socket.io] Client ${socket.id} joined ticket room ticket:${ticketId}`);
    });

    socket.on('leave_ticket', (ticketId) => {
      socket.leave(`ticket:${ticketId}`);
    });

    // Join role channel (e.g. agents room for notification popups)
    socket.on('join_agents', () => {
      socket.join('agents_channel');
      console.log(`[Socket.io] Agent ${socket.id} joined agents_channel`);
    });

    // Handle typing indicators
    socket.on('typing', ({ ticketId, user }) => {
      socket.to(`ticket:${ticketId}`).emit('user_typing', { ticketId, user });
    });

    socket.on('stop_typing', ({ ticketId, user }) => {
      socket.to(`ticket:${ticketId}`).emit('user_stop_typing', { ticketId, user });
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized!');
  }
  return ioInstance;
};

// Helper notification emitters
const emitTicketUpdated = (ticket) => {
  if (ioInstance) {
    ioInstance.to(`ticket:${ticket._id}`).emit('ticket_updated', ticket);
    ioInstance.to('agents_channel').emit('ticket_updated', ticket);
  }
};

const emitNewTicket = (ticket) => {
  if (ioInstance) {
    ioInstance.to('agents_channel').emit('new_ticket', ticket);
  }
};

const emitNewMessage = (ticketId, message) => {
  if (ioInstance) {
    ioInstance.to(`ticket:${ticketId}`).emit('new_message', message);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitTicketUpdated,
  emitNewTicket,
  emitNewMessage,
};
