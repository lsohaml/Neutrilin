const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateBmr, calculateTdee, calculateCalorieTarget } = require('../src/utils/calorieEngine');

test('Mifflin–St Jeor BMR matches known reference calculations', () => {
  assert.equal(calculateBmr({ weightKg: 70, heightCm: 170, age: 30, sexForCalculation: 'female' }), 1452);
  assert.equal(calculateBmr({ weightKg: 80, heightCm: 180, age: 40, sexForCalculation: 'male' }), 1730);
});

test('TDEE and a weight-loss target use the configured activity multiplier', () => {
  assert.equal(calculateTdee(1452, 'moderately_active'), 2251);
  const result = calculateCalorieTarget({ weightKg: 70, heightCm: 170, age: 30, sexForCalculation: 'female', activityLevel: 'moderately_active', currentWeightKg: 70 }, { targetWeightKg: 65 });
  assert.equal(result.direction, 'lose');
  assert.equal(result.calorieTarget, 1751);
  assert.equal(result.safetyFloorApplied, false);
});
