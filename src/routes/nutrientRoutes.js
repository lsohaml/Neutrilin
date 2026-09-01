const express = require('express');
const { authenticate } = require('../middleware/auth');

function createNutrientRoutes(controller) {
  const router = express.Router();
  router.get('/', authenticate, controller.getFlags);
  return router;
}

module.exports = { createNutrientRoutes };
