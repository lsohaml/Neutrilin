const { z } = require('zod');
const { calculateBmi } = require('../utils/bmi');

const activityLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'];

const profileSchema = z.object({
  heightCm: z.coerce.number().min(80).max(250),
  currentWeightKg: z.coerce.number().min(25).max(400),
  activityLevel: z.enum(activityLevels),
  age: z.coerce.number().int().min(18).max(120).optional(),
  sexForCalculation: z.enum(['female', 'male']).optional(),
});

const conditionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(1000).optional(),
});

const medicalRecordSchema = z.object({
  medicalRecord: z.string().trim().min(10).max(10000),
});

const goalSchema = z.object({
  targetWeightKg: z.coerce.number().min(25).max(400).optional(),
  targetBmi: z.coerce.number().min(12).max(60).optional(),
  targetDate: z.coerce.date().optional(),
}).refine((goal) => goal.targetWeightKg !== undefined || goal.targetBmi !== undefined, {
  message: 'Set a target weight or target BMI.',
}).refine((goal) => !goal.targetDate || goal.targetDate >= new Date(new Date().toDateString()), {
  message: 'Target date must be today or later.',
});

function validationError(res, error, message) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: message, details: z.treeifyError(error) });
  }
  return null;
}

function formatProfile(profile) {
  return profile && { ...profile, bmi: calculateBmi(profile.currentWeightKg, profile.heightCm) };
}

function createProfileController(prisma) {
  return {
    async saveProfile(req, res, next) {
      try {
        const data = profileSchema.parse(req.body);
        const profile = await prisma.profile.upsert({
          where: { userId: req.user.id },
          update: data,
          create: { userId: req.user.id, ...data },
        });
        return res.status(200).json({ profile: formatProfile(profile) });
      } catch (error) {
        if (validationError(res, error, 'Enter a height, weight, and activity level within the supported ranges.')) return;
        return next(error);
      }
    },

    async getProfile(req, res, next) {
      try {
        const [profile, medicalConditions, goal] = await Promise.all([
          prisma.profile.findUnique({ where: { userId: req.user.id } }),
          prisma.medicalCondition.findMany({ where: { userId: req.user.id }, orderBy: { name: 'asc' } }),
          prisma.weightGoal.findUnique({ where: { userId: req.user.id } }),
        ]);
        return res.json({ profile: formatProfile(profile), medicalConditions, goal });
      } catch (error) {
        return next(error);
      }
    },

    async addMedicalCondition(req, res, next) {
      try {
        const data = conditionSchema.parse(req.body);
        const condition = await prisma.medicalCondition.create({ data: { userId: req.user.id, ...data } });
        return res.status(201).json({ medicalCondition: condition });
      } catch (error) {
        if (validationError(res, error, 'Enter a medical-condition name and optional notes.')) return;
        return next(error);
      }
    },

    async saveMedicalRecord(req, res, next) {
      try {
        const { medicalRecord } = medicalRecordSchema.parse(req.body);
        const existingProfile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
        if (!existingProfile) {
          return res.status(409).json({ error: 'Save your basic profile before adding a medical record.' });
        }
        const profile = await prisma.profile.update({
          where: { userId: req.user.id },
          data: { medicalRecord },
        });
        return res.status(200).json({ medicalRecord: profile.medicalRecord });
      } catch (error) {
        if (validationError(res, error, 'Enter a medical record between 10 and 10,000 characters.')) return;
        return next(error);
      }
    },

    async deleteMedicalCondition(req, res, next) {
      try {
        const condition = await prisma.medicalCondition.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!condition) return res.status(404).json({ error: 'Medical condition not found.' });
        await prisma.medicalCondition.delete({ where: { id: condition.id } });
        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    },

    async saveGoal(req, res, next) {
      try {
        const parsed = goalSchema.parse(req.body);
        const data = {
          targetWeightKg: parsed.targetWeightKg ?? null,
          targetBmi: parsed.targetBmi ?? null,
          targetDate: parsed.targetDate ?? null,
        };
        const goal = await prisma.weightGoal.upsert({
          where: { userId: req.user.id },
          update: data,
          create: { userId: req.user.id, ...data },
        });
        return res.status(200).json({ goal });
      } catch (error) {
        if (validationError(res, error, 'Set a realistic target weight or BMI and an optional future target date.')) return;
        return next(error);
      }
    },

    async getGoal(req, res, next) {
      try {
        const goal = await prisma.weightGoal.findUnique({ where: { userId: req.user.id } });
        return res.json({ goal });
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = { activityLevels, createProfileController };
