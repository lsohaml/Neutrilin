const { calculateCalorieTarget } = require('../utils/calorieEngine');

function createCalorieController(prisma) {
  return {
    async getTarget(req, res, next) {
      try {
        const [profile, goal] = await Promise.all([
          prisma.profile.findUnique({ where: { userId: req.user.id } }),
          prisma.weightGoal.findUnique({ where: { userId: req.user.id } }),
        ]);

        if (!profile) return res.status(409).json({ error: 'Save your profile before requesting a calorie target.' });
        if (!profile.age || !profile.sexForCalculation) {
          return res.status(422).json({ error: 'Add your age and sex for calculation to receive a personalized calorie target.' });
        }

        const target = calculateCalorieTarget(profile, goal);
        return res.json({
          ...target,
          reasoning: {
            formula: 'Mifflin–St Jeor BMR multiplied by your selected activity level.',
            goalAdjustment: target.direction === 'lose' ? 'A moderate 500 kcal daily deficit was applied.' : target.direction === 'gain' ? 'A modest 300 kcal daily surplus was applied.' : 'No calorie adjustment was applied because your goal is maintenance.',
            safety: target.safetyFloorApplied ? 'The requested target was raised to the 1,200 kcal safety floor. Consult a qualified clinician before attempting a lower intake.' : 'The target did not require the 1,200 kcal safety floor.',
          },
          disclaimer: 'This is general wellness information, not medical advice. Consult a qualified clinician for personal nutrition or treatment guidance.',
        });
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = { createCalorieController };
