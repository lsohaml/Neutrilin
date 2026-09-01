const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

process.env.JWT_SECRET = 'test-secret-that-is-long-enough';

const createdAt = new Date('2026-09-01T00:00:00.000Z');
const users = new Map();
const prisma = {
  user: {
    findUnique: async ({ where: { email } }) => users.get(email) || null,
    create: async ({ data }) => {
      const user = { id: `user-${users.size + 1}`, ...data, createdAt };
      users.set(user.email, user);
      return user;
    },
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
