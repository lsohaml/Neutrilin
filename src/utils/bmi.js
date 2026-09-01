function calculateBmi(weightKg, heightCm) {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM ** 2)) * 10) / 10;
}

module.exports = { calculateBmi };
