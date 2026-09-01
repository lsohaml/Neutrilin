const test = require('node:test');
const assert = require('node:assert/strict');
const { createSuggestionService } = require('../src/services/suggestionService');

test('AI suggestions are grounded in the saved daily data and then cached', async () => {
  let cachedRecord = null;
  let calls = 0;
  let lastPrompt = '';
  const now = () => new Date('2026-09-01T10:00:00.000Z');
  const prisma = {
    profile: { findUnique: async () => ({ currentWeightKg: 70, heightCm: 170, age: 30, sexForCalculation: 'female', activityLevel: 'moderately_active' }) },
    weightGoal: { findUnique: async () => ({ targetWeightKg: 65 }) },
    dailyLog: { findUnique: async () => ({ caloriesConsumed: 1000 }) },
    medicalCondition: { findMany: async () => [{ name: 'Type 2 diabetes' }] },
    suggestionCache: {
      findUnique: async () => cachedRecord,
      upsert: async ({ create }) => { cachedRecord = create; return create; },
    },
  };
  const ai = { generate: async (prompt) => {
    calls += 1;
    lastPrompt = prompt;
    return '{"suggestions":[{"suggestion":"Choose a balanced lunch.","why":"You have logged 1,000 kcal against your target."}]}';
  } };
  const service = createSuggestionService({ prisma, ai, now });

  const fresh = await service.getTodaySuggestions('user-1');
  assert.equal(fresh.cached, false);
  assert.equal(fresh.suggestions[0].why, 'You have logged 1,000 kcal against your target.');
  assert.match(lastPrompt, /Today logged calories: 1000 kcal/);
  assert.match(lastPrompt, /Dietary fiber/);

  const cached = await service.getTodaySuggestions('user-1');
  assert.equal(cached.cached, true);
  assert.equal(calls, 1);
});
