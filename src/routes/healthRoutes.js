const express = require('express');
const { authenticate } = require('../middleware/auth');

function createHealthRoutes() {
  const router = express.Router();
  router.get('/', (req, res) => res.json({ status: 'ok' }));
  router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));
  return router;
}

module.exports = { createHealthRoutes };
