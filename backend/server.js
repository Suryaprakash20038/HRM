require('dotenv').config(); // Load env vars

const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB()
  .then(() => {
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);

      // Initialize Socket.IO
      const io = require('socket.io')(server, {
        cors: {
          origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.CLIENT_URL
          ].filter(Boolean),
          methods: ['GET', 'POST'],
          credentials: true
        }
      });

      const socketService = require('./src/services/socket.service');
      socketService.setIo(io);

      app.set('io', io);
      require('./src/socket/socketHandler')(io);
      console.log('🔌 Socket.IO initialized');

      // Verify Email Service
      const { verifyConnection } = require('./src/services/email.service');
      verifyConnection();

      // Initialize cron jobs
      const { scheduleMediaCleanup } = require('./src/utils/cronJobs');
      scheduleMediaCleanup();

      const initCronJobs = require('./src/services/cron.service');
      initCronJobs();
    });

    // Handle graceful shutdown
    const gracefulShutdown = () => {
      console.log('🔄 Received kill signal, shutting down gracefully');
      server.close(() => {
        console.log('✅ Closed out remaining connections');
        process.exit(0);
      });

      // Force close if it takes too long
      setTimeout(() => {
        console.error('🔴 Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  })
  .catch((error) => {
    logger.error('Failed to connect to database:', error);
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.log('❌ Unhandled Rejection! Logging error but keeping server alive...');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('❌ Uncaught Exception! Logging error...', err);
});



