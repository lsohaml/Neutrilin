const express = require('express');
const { authenticate } = require('../middleware/auth');

function createCalorieRoutes(controller) {
  const router = express.Router();
  router.get('/', authenticate, controller.getTarget);
  return router;
}

module.exports = { createCalorieRoutes };
