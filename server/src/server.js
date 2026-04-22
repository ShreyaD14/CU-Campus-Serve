require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initializeDatabase } = require('./config/database');
const { initializeSockets } = require('./sockets/orderSocket');

const PORT = process.env.PORT || 3001;

// Initialize DB schema
initializeDatabase();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSockets(server);

server.listen(PORT, () => {
  console.log(`🚀 CampusServe API running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

// Restart trigger
