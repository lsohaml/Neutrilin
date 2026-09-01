const { z } = require('zod');
const { calculateCalorieTarget } = require('../utils/calorieEngine');
const { toDayStart, nextDay } = require('../utils/dates');

const foodEntrySchema = z.object({
  name: z.string().trim().min(1).max(140),
  calories: z.coerce.number().int().min(0).max(10000),
  loggedAt: z.coerce.date().optional(),
});

function invalidDate(res) {
  return res.status(400).json({ error: 'Use a valid date in YYYY-MM-DD format.' });
}

function createLogController(prisma) {
  async function listForDate(userId, date) {
    const start = toDayStart(date);
    if (!start) return null;
    const entries = await prisma.foodEntry.findMany({
      where: { userId, loggedAt: { gte: start, lt: nextDay(start) } },
      orderBy: { loggedAt: 'desc' },
    });
    const caloriesConsumed = entries.reduce((total, entry) => total + entry.calories, 0);
    return { date: start.toISOString().slice(0, 10), entries, caloriesConsumed };
  }

  return {
    async createLog(req, res, next) {
      try {
        const data = foodEntrySchema.parse(req.body);
        const loggedAt = data.loggedAt || new Date();
        const day = toDayStart(loggedAt);
        const entry = await prisma.foodEntry.create({ data: { userId: req.user.id, name: data.name, calories: data.calories, loggedAt } });
        const entries = await prisma.foodEntry.findMany({ where: { userId: req.user.id, loggedAt: { gte: day, lt: nextDay(day) } } });
        const caloriesConsumed = entries.reduce((total, item) => total + item.calories, 0);
        await prisma.dailyLog.upsert({
          where: { userId_date: { userId: req.user.id, date: day } },
          update: { caloriesConsumed },
          create: { userId: req.user.id, date: day, caloriesConsumed },
        });
        return res.status(201).json({ entry, caloriesConsumed });
      } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Enter a food name, calories between 0 and 10,000, and an optional valid date/time.' });
        return next(error);
      }
    },

    async getLogs(req, res, next) {
      try {
        const result = await listForDate(req.user.id, req.query.date);
        if (!result) return invalidDate(res);
        return res.json(result);
      } catch (error) { return next(error); }
    },

    async getSummary(req, res, next) {
      try {
        const result = await listForDate(req.user.id, req.query.date);
        if (!result) return invalidDate(res);
        const [profile, goal] = await Promise.all([
          prisma.profile.findUnique({ where: { userId: req.user.id } }),
          prisma.weightGoal.findUnique({ where: { userId: req.user.id } }),
        ]);
        if (!profile?.age || !profile?.sexForCalculation) {
          return res.status(422).json({ error: 'Complete your profile with age and sex for calculation before requesting a summary.' });
        }
        const target = calculateCalorieTarget(profile, goal);
        return res.json({ ...result, calorieTarget: target.calorieTarget, remainingCalories: Math.max(target.calorieTarget - result.caloriesConsumed, 0), overTargetCalories: Math.max(result.caloriesConsumed - target.calorieTarget, 0) });
      } catch (error) { return next(error); }
    },
  };
}

module.exports = { createLogController };
