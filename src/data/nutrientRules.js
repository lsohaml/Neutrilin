const nutrientRules = [
  {
    aliases: ['anemia', 'anaemia', 'iron deficiency anemia', 'iron deficiency anaemia'],
    considerations: [
      { nutrient: 'Iron', reason: 'Iron status is commonly assessed in some forms of anemia.' },
      { nutrient: 'Vitamin B12', reason: 'Vitamin B12 status is commonly assessed in some forms of anemia.' },
    ],
  },
  {
    aliases: ['diabetes', 'type 1 diabetes', 'type 2 diabetes', 'prediabetes'],
    considerations: [
      { nutrient: 'Dietary fiber', reason: 'Fiber-containing carbohydrates and overall carbohydrate patterns can be useful discussion points in diabetes nutrition planning.' },
      { nutrient: 'Carbohydrate awareness', reason: 'Food labels list total carbohydrate, including sugars, starches, and fiber.' },
    ],
  },
  {
    aliases: ['osteoporosis', 'osteopenia'],
    considerations: [
      { nutrient: 'Calcium', reason: 'Calcium is an important nutrient for bone health.' },
      { nutrient: 'Vitamin D', reason: 'Vitamin D helps the body absorb calcium.' },
    ],
  },
];

function normalizeCondition(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getNutrientFlags(conditions) {
  return conditions.flatMap((condition) => {
    const normalized = normalizeCondition(condition.name);
    const matchedRule = nutrientRules.find((rule) => rule.aliases.some((alias) => normalized === alias || normalized.includes(alias)));
    return matchedRule ? [{ condition: condition.name, considerations: matchedRule.considerations }] : [];
  });
}

module.exports = { nutrientRules, getNutrientFlags };
