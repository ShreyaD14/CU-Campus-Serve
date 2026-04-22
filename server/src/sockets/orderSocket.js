const { Server } = require('socket.io');

let io;

function initializeSockets(server) {
  io = new Server(server, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Track order (customer joins the order room)
    socket.on('order:track', ({ orderId }) => {
      socket.join(`order-${orderId}`);
      console.log(`📦 Tracking order-${orderId}`);
    });

    // Vendor joins their shop room
    socket.on('vendor:join', ({ shopId }) => {
      socket.join(`vendor-${shopId}`);
      console.log(`🏪 Vendor joined shop-${shopId}`);
    });

    // Delivery agent joins their room
    socket.on('agent:join', ({ agentId }) => {
      socket.join(`agent-${agentId}`);
      console.log(`🚴 Agent joined agent-${agentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initializeSockets, getIO };
