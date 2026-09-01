const express = require('express');
const cors = require('cors');
const { createAuthController } = require('./controllers/authController');
const { createAuthRoutes } = require('./routes/authRoutes');
const { createHealthRoutes } = require('./routes/healthRoutes');
const { createProfileController } = require('./controllers/profileController');
const { createProfileRoutes } = require('./routes/profileRoutes');
const { createCalorieController } = require('./controllers/calorieController');
const { createCalorieRoutes } = require('./routes/calorieRoutes');
const { createNutrientController } = require('./controllers/nutrientController');
const { createNutrientRoutes } = require('./routes/nutrientRoutes');
const { createSuggestionService } = require('./services/suggestionService');
const { createSuggestionController } = require('./controllers/suggestionController');
const { createSuggestionRoutes } = require('./routes/suggestionRoutes');
const { createLogController } = require('./controllers/logController');
const { createLogRoutes } = require('./routes/logRoutes');
const { createProgressController } = require('./controllers/progressController');
const { createProgressRoutes } = require('./routes/progressRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(prisma, anthropic = null) {
  const app = express();
  const allowedOrigin = process.env.CORS_ORIGIN;
  app.use(cors({ origin: allowedOrigin ? allowedOrigin.split(',').map((origin) => origin.trim()) : false }));
  app.use(express.json({ limit: '20kb' }));
  app.use('/auth', createAuthRoutes(createAuthController(prisma)));
  app.use('/health', createHealthRoutes());
  app.use('/profile', createProfileRoutes(createProfileController(prisma)));
  app.use('/calorie-target', createCalorieRoutes(createCalorieController(prisma)));
  app.use('/nutrient-flags', createNutrientRoutes(createNutrientController(prisma)));
  app.use('/suggestions', createSuggestionRoutes(createSuggestionController(createSuggestionService({ prisma, anthropic }))));
  app.use('/logs', createLogRoutes(createLogController(prisma)));
  app.use('/progress', createProgressRoutes(createProgressController(prisma)));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
