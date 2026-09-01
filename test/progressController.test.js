const test = require('node:test');
const assert = require('node:assert/strict');
const { estimateProgress } = require('../src/controllers/progressController');

test('progress estimate uses the first and most recent recorded weights', () => {
  const result = estimateProgress([{ weightKg: 80 }, { weightKg: 76 }], 70);
  assert.equal(result.percent, 40);
  assert.equal(result.estimatedWeeksRemaining, 12);
});
