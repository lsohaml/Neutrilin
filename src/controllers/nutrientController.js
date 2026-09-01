const { getNutrientFlags } = require('../data/nutrientRules');

function createNutrientController(prisma) {
  return {
    async getFlags(req, res, next) {
      try {
        const medicalConditions = await prisma.medicalCondition.findMany({
          where: { userId: req.user.id },
          orderBy: { name: 'asc' },
        });
        return res.json({
          flags: getNutrientFlags(medicalConditions),
          disclaimer: 'These are general dietary considerations from conditions you entered. They do not identify a deficiency, diagnose a condition, or replace guidance from your clinician or registered dietitian. Do not start or change supplements or treatment based on this screen.',
        });
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = { createNutrientController };
