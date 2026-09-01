const express = require('express');
const { createAuthController } = require('./controllers/authController');
const { createAuthRoutes } = require('./routes/authRoutes');
const { createHealthRoutes } = require('./routes/healthRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(prisma) {
  const app = express();
  app.use(express.json({ limit: '20kb' }));
  app.use('/auth', createAuthRoutes(createAuthController(prisma)));
  app.use('/health', createHealthRoutes());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
