const express = require('express');
const { authenticate } = require('../middleware/auth');

function createSuggestionRoutes(controller) {
  const router = express.Router();
  router.get('/', authenticate, controller.getSuggestions);
  return router;
}

module.exports = { createSuggestionRoutes };
