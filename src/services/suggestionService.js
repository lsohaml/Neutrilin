const { calculateCalorieTarget } = require('../utils/calorieEngine');
const { getNutrientFlags } = require('../data/nutrientRules');

function dayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function extractText(response) {
  return response.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n');
}

function parseSuggestions(text) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.suggestions) || !parsed.suggestions.every((item) => typeof item.suggestion === 'string' && typeof item.why === 'string')) {
    throw new Error('The AI response did not use the requested format.');
  }
  return parsed.suggestions.slice(0, 4);
}

function buildPrompt({ profile, dailyLog, target, flags }) {
  return `Create 2-4 brief, practical, general-wellness nutrition suggestions from this user data. Return only JSON: {"suggestions":[{"suggestion":"...","why":"..."}]}.

Rules: Ground every suggestion in the data below. Do not diagnose, claim a deficiency, prescribe treatment or supplements, recommend an extreme calorie restriction, or override a clinician. Do not invent foods already eaten. If intake is absent, say that no meals have been logged. Mention a clinician/registered dietitian when condition-related information needs individual assessment.

User data:
- Daily calorie target: ${target.calorieTarget} kcal (${target.direction} goal)
- Today logged calories: ${dailyLog?.caloriesConsumed ?? 0} kcal${dailyLog ? '' : ' (no daily log exists yet)'}
- Remaining estimate: ${Math.max(target.calorieTarget - (dailyLog?.caloriesConsumed ?? 0), 0)} kcal
- Nutrition considerations from user-entered conditions: ${JSON.stringify(flags)}
- Activity level: ${profile.activityLevel}`;
}

function createSuggestionService({ prisma, anthropic, now = () => new Date() }) {
  const recentRequests = new Map();
  return {
    async getTodaySuggestions(userId) {
      const today = dayStart(now());
      const [profile, goal, dailyLog, conditions] = await Promise.all([
        prisma.profile.findUnique({ where: { userId } }),
        prisma.weightGoal.findUnique({ where: { userId } }),
        prisma.dailyLog.findUnique({ where: { userId_date: { userId, date: today } } }),
        prisma.medicalCondition.findMany({ where: { userId }, orderBy: { name: 'asc' } }),
      ]);
      if (!profile?.age || !profile?.sexForCalculation) {
        const error = new Error('Complete your profile with age and sex for calculation before requesting suggestions.');
        error.status = 422;
        throw error;
      }

      const cached = await prisma.suggestionCache.findUnique({ where: { userId_date: { userId, date: today } } });
      if (cached?.expiresAt > now()) return { suggestions: JSON.parse(cached.suggestionsJson), cached: true };

      const previousRequest = recentRequests.get(userId);
      if (previousRequest && now().getTime() - previousRequest < 60_000) {
        const error = new Error('Please wait a minute before requesting another fresh suggestion.');
        error.status = 429;
        throw error;
      }
      if (!anthropic) {
        const error = new Error('AI suggestions are not configured yet. Add ANTHROPIC_API_KEY to the server environment.');
        error.status = 503;
        throw error;
      }

      recentRequests.set(userId, now().getTime());
      const target = calculateCalorieTarget(profile, goal);
      const response = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
        max_tokens: 700,
        messages: [{ role: 'user', content: buildPrompt({ profile, dailyLog, target, flags: getNutrientFlags(conditions) }) }],
      });
      const suggestions = parseSuggestions(extractText(response));
      const expiresAt = new Date(now().getTime() + 6 * 60 * 60 * 1000);
      await prisma.suggestionCache.upsert({
        where: { userId_date: { userId, date: today } },
        update: { suggestionsJson: JSON.stringify(suggestions), expiresAt },
        create: { userId, date: today, suggestionsJson: JSON.stringify(suggestions), expiresAt },
      });
      return { suggestions, cached: false };
    },
  };
}

module.exports = { createSuggestionService, buildPrompt, parseSuggestions };
