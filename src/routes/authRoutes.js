const express = require('express');

function createAuthRoutes(controller) {
  const router = express.Router();
  router.post('/signup', controller.signup);
  router.post('/login', controller.login);
  return router;
}

module.exports = { createAuthRoutes };
