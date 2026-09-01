const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

process.env.JWT_SECRET = 'test-secret-that-is-long-enough';

const createdAt = new Date('2026-09-01T00:00:00.000Z');
const users = new Map();
const profiles = new Map();
const conditions = new Map();
const goals = new Map();
let nextConditionId = 1;
const prisma = {
  user: {
    findUnique: async ({ where: { email } }) => users.get(email) || null,
    create: async ({ data }) => {
      const user = { id: `user-${users.size + 1}`, ...data, createdAt };
      users.set(user.email, user);
      return user;
    },
  },
  profile: {
    upsert: async ({ where: { userId }, update, create }) => {
      const record = profiles.get(userId) || { id: `profile-${userId}`, createdAt };
      const profile = { ...record, ...(profiles.has(userId) ? update : create), updatedAt: createdAt };
      profiles.set(userId, profile);
      return profile;
    },
    findUnique: async ({ where: { userId } }) => profiles.get(userId) || null,
    update: async ({ where: { userId }, data }) => {
      const profile = { ...profiles.get(userId), ...data, updatedAt: createdAt };
      profiles.set(userId, profile);
      return profile;
    },
  },
  medicalCondition: {
    create: async ({ data }) => {
      const condition = { id: `condition-${nextConditionId++}`, ...data };
      conditions.set(condition.id, condition);
      return condition;
    },
    findMany: async ({ where: { userId } }) => [...conditions.values()].filter((item) => item.userId === userId),
    findFirst: async ({ where: { id, userId } }) => {
      const condition = conditions.get(id);
      return condition?.userId === userId ? condition : null;
    },
    delete: async ({ where: { id } }) => conditions.delete(id),
  },
  weightGoal: {
    upsert: async ({ where: { userId }, update, create }) => {
      const goal = { id: `goal-${userId}`, ...(goals.get(userId) || create), ...(goals.has(userId) ? update : {}) };
      goals.set(userId, goal);
      return goal;
    },
    findUnique: async ({ where: { userId } }) => goals.get(userId) || null,
  },
  dailyLog: {
    findUnique: async () => null,
  },
  suggestionCache: {
    findUnique: async () => null,
    upsert: async () => null,
  },
};

const app = createApp(prisma);

test('health endpoint reports OK', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('users can sign up and use a protected route', async () => {
  const signup = await request(app).post('/auth/signup').send({ email: 'Test@Example.com', password: 'safe-password' });
  assert.equal(signup.status, 201);
  assert.equal(signup.body.user.email, 'test@example.com');
  assert.ok(signup.body.token);

  const profile = await request(app).get('/health/me').set('Authorization', `Bearer ${signup.body.token}`);
  assert.equal(profile.status, 200);
  assert.equal(profile.body.user.email, 'test@example.com');
});

test('authenticated users can complete and retrieve their profile', async () => {
  const signup = await request(app).post('/auth/signup').send({ email: 'profile@example.com', password: 'safe-password' });
  const auth = { Authorization: `Bearer ${signup.body.token}` };

  const saveProfile = await request(app).post('/profile').set(auth).send({
    heightCm: 170,
    currentWeightKg: 70,
    activityLevel: 'moderately_active',
    age: 30,
    sexForCalculation: 'female',
  });
  assert.equal(saveProfile.status, 200);
  assert.equal(saveProfile.body.profile.bmi, 24.2);

  const record = await request(app).post('/profile/medical-record').set(auth).send({
    medicalRecord: 'User-entered summary: iron deficiency was previously noted in a health record.',
  });
  assert.equal(record.status, 200);
  assert.match(record.body.medicalRecord, /User-entered summary/);

  const condition = await request(app).post('/profile/medical-conditions').set(auth).send({ name: 'Iron deficiency anemia', notes: 'Self-reported' });
  assert.equal(condition.status, 201);

  const goal = await request(app).post('/profile/goal').set(auth).send({ targetWeightKg: 65, targetDate: '2026-12-31' });
  assert.equal(goal.status, 200);
  assert.equal(goal.body.goal.targetWeightKg, 65);

  const calorieTarget = await request(app).get('/calorie-target').set(auth);
  assert.equal(calorieTarget.status, 200);
  assert.equal(calorieTarget.body.direction, 'lose');
  assert.equal(calorieTarget.body.calorieTarget, 1751);

  const nutrientFlags = await request(app).get('/nutrient-flags').set(auth);
  assert.equal(nutrientFlags.status, 200);
  assert.equal(nutrientFlags.body.flags[0].considerations[0].nutrient, 'Iron');

  const suggestions = await request(app).get('/suggestions').set(auth);
  assert.equal(suggestions.status, 503);

  const loaded = await request(app).get('/profile').set(auth);
  assert.equal(loaded.status, 200);
  assert.equal(loaded.body.medicalConditions.length, 1);
  assert.equal(loaded.body.goal.targetWeightKg, 65);

  const remove = await request(app).delete(`/profile/medical-conditions/${condition.body.medicalCondition.id}`).set(auth);
  assert.equal(remove.status, 204);
});
