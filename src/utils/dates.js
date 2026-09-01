function toDayStart(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextDay(value) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

module.exports = { toDayStart, nextDay };
