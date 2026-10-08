const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const masterApiRoutes = require('./routes/index');

// Models for initial empty DB auto-seed check
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

initSocket(io);

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount Master API Router
app.use('/api', masterApiRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();

  // Check if users exist; if not, auto-seed
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AutoSeed] Empty database detected. Triggering initial demo seeder...');
      const { seedData } = require('./seeds/seed');
      await seedData();
    }
  } catch (err) {
    console.warn('[AutoSeed] Notice:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ResolvAI Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket server initialized`);
    console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`✨ Light-Theme Edition Active`);
    console.log(`======================================================\n`);
  });
};

startServer();
