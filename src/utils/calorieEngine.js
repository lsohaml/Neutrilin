const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

function round(value) {
  return Math.round(value);
}

function calculateBmr({ weightKg, currentWeightKg, heightCm, age, sexForCalculation }) {
  const resolvedWeightKg = weightKg ?? currentWeightKg;
  const base = (10 * resolvedWeightKg) + (6.25 * heightCm) - (5 * age);
  if (sexForCalculation === 'male') return round(base + 5);
  if (sexForCalculation === 'female') return round(base - 161);
  throw new Error('A supported sex for calculation is required.');
}

function calculateTdee(bmr, activityLevel) {
  const multiplier = activityMultipliers[activityLevel];
  if (!multiplier) throw new Error('A supported activity level is required.');
  return round(bmr * multiplier);
}

function determineGoalDirection({ currentWeightKg, heightCm, goal }) {
  if (!goal) return { direction: 'maintain', targetWeightKg: null };
  const targetWeightKg = goal.targetWeightKg ?? (goal.targetBmi * ((heightCm / 100) ** 2));
  const difference = targetWeightKg - currentWeightKg;
  if (Math.abs(difference) < 0.5) return { direction: 'maintain', targetWeightKg: round(targetWeightKg * 10) / 10 };
  return { direction: difference < 0 ? 'lose' : 'gain', targetWeightKg: round(targetWeightKg * 10) / 10 };
}

function calculateCalorieTarget(profile, goal) {
  const bmr = calculateBmr(profile);
  const tdee = calculateTdee(bmr, profile.activityLevel);
  const { direction, targetWeightKg } = determineGoalDirection({ ...profile, goal });
  const requestedAdjustment = direction === 'lose' ? -500 : direction === 'gain' ? 300 : 0;
  const requestedTarget = tdee + requestedAdjustment;
  const safetyFloor = 1200;
  const calorieTarget = Math.max(requestedTarget, safetyFloor);

  return {
    bmr,
    tdee,
    direction,
    targetWeightKg,
    requestedAdjustment,
    calorieTarget,
    safetyFloorApplied: requestedTarget < safetyFloor,
  };
}

module.exports = { activityMultipliers, calculateBmr, calculateTdee, calculateCalorieTarget };
