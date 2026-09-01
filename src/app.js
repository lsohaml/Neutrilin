const express = require('express');
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
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(prisma, anthropic = null) {
  const app = express();
  app.use(express.json({ limit: '20kb' }));
  app.use('/auth', createAuthRoutes(createAuthController(prisma)));
  app.use('/health', createHealthRoutes());
  app.use('/profile', createProfileRoutes(createProfileController(prisma)));
  app.use('/calorie-target', createCalorieRoutes(createCalorieController(prisma)));
  app.use('/nutrient-flags', createNutrientRoutes(createNutrientController(prisma)));
  app.use('/suggestions', createSuggestionRoutes(createSuggestionController(createSuggestionService({ prisma, anthropic }))));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
