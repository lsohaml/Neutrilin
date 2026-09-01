const express = require('express');
const { authenticate } = require('../middleware/auth');

function createLogRoutes(controller) {
  const router = express.Router();
  router.use(authenticate);
  router.post('/', controller.createLog);
  router.get('/', controller.getLogs);
  router.get('/summary', controller.getSummary);
  return router;
}

module.exports = { createLogRoutes };
