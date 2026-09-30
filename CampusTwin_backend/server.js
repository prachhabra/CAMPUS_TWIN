require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./socket');

// Validate critical environment variables on startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error('====================================================');
  console.error('[FATAL CONFIGURATION ERROR] Missing required environment variables:');
  missingEnv.forEach((key) => console.error(`  - ${key}`));
  console.error('Please configure these keys in your CampusTwin_backend/.env file.');
  console.error('====================================================');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach socket logic
initSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` CampusTwin Backend Server Running on Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` API Base: http://localhost:${PORT}/api`);
  console.log(` Socket.io Initialized & Listening`);
  console.log(`====================================================`);
});

// Process event handlers for unhandled errors
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception]: ${err.message}`);
});
