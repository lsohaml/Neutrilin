const { z } = require('zod');

const weightSchema = z.object({
  weightKg: z.coerce.number().min(25).max(400),
  recordedAt: z.coerce.date().optional(),
});

function targetWeight(goal, profile) {
  if (!goal) return null;
  if (goal.targetWeightKg) return goal.targetWeightKg;
  if (goal.targetBmi && profile?.heightCm) return Math.round(goal.targetBmi * ((profile.heightCm / 100) ** 2) * 10) / 10;
  return null;
}

function estimateProgress(entries, target) {
  if (!entries.length || target === null) return null;
  const start = entries[0].weightKg;
  const current = entries.at(-1).weightKg;
  const totalChangeNeeded = Math.abs(target - start);
  const changeRemaining = Math.abs(target - current);
  const percent = totalChangeNeeded === 0 ? 100 : Math.min(100, Math.round(((totalChangeNeeded - changeRemaining) / totalChangeNeeded) * 100));
  const weeklyRateKg = 0.5;
  const estimatedWeeksRemaining = Math.ceil(changeRemaining / weeklyRateKg);
  return { startWeightKg: start, currentWeightKg: current, targetWeightKg: target, percent, estimatedWeeksRemaining, note: 'Timeline uses a simple 0.5 kg/week illustration. Actual changes vary; consult a qualified clinician for personalized guidance.' };
}

function createProgressController(prisma) {
  return {
    async addWeight(req, res, next) {
      try {
        const data = weightSchema.parse(req.body);
        const recordedAt = data.recordedAt || new Date();
        const entry = await prisma.weightEntry.upsert({
          where: { userId_recordedAt: { userId: req.user.id, recordedAt } },
          update: { weightKg: data.weightKg },
          create: { userId: req.user.id, weightKg: data.weightKg, recordedAt },
        });
        return res.status(201).json({ entry });
      } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Enter a realistic weight and an optional valid date/time.' });
        return next(error);
      }
    },

    async getProgress(req, res, next) {
      try {
        const [profile, goal, entries] = await Promise.all([
          prisma.profile.findUnique({ where: { userId: req.user.id } }),
          prisma.weightGoal.findUnique({ where: { userId: req.user.id } }),
          prisma.weightEntry.findMany({ where: { userId: req.user.id }, orderBy: { recordedAt: 'asc' } }),
        ]);
        const resolvedTarget = targetWeight(goal, profile);
        return res.json({ entries, progress: estimateProgress(entries, resolvedTarget), disclaimer: 'Weight trends are informational and are not medical advice.' });
      } catch (error) { return next(error); }
    },
  };
}

module.exports = { createProgressController, estimateProgress };
