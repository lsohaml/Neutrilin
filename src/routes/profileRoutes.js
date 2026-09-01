const express = require('express');
const { authenticate } = require('../middleware/auth');

function createProfileRoutes(controller) {
  const router = express.Router();
  router.use(authenticate);
  router.post('/', controller.saveProfile);
  router.get('/', controller.getProfile);
  router.post('/medical-record', controller.saveMedicalRecord);
  router.post('/medical-conditions', controller.addMedicalCondition);
  router.delete('/medical-conditions/:id', controller.deleteMedicalCondition);
  router.post('/goal', controller.saveGoal);
  router.get('/goal', controller.getGoal);
  return router;
}

module.exports = { createProfileRoutes };
