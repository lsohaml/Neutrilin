const express = require('express');
const { authenticate } = require('../middleware/auth');

function createProgressRoutes(controller) {
  const router = express.Router();
  router.use(authenticate);
  router.post('/weight', controller.addWeight);
  router.get('/', controller.getProgress);
  return router;
}

module.exports = { createProgressRoutes };
