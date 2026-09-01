const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

function publicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

function issueToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: '7d',
  });
}

function createAuthController(prisma) {
  return {
    async signup(req, res, next) {
      try {
        const { email, password } = credentialsSchema.parse(req.body);
        const normalizedEmail = email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({ data: { email: normalizedEmail, passwordHash } });
        return res.status(201).json({ user: publicUser(user), token: issueToken(user) });
      } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Enter a valid email and a password of at least 8 characters.' });
        return next(error);
      }
    },

    async login(req, res, next) {
      try {
        const { email, password } = credentialsSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        const valid = user && await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Incorrect email or password.' });

        return res.json({ user: publicUser(user), token: issueToken(user) });
      } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Enter a valid email and password.' });
        return next(error);
      }
    },
  };
}

module.exports = { createAuthController };
