// Calendar dates deliberately use the device's local time, never a UTC slice.
export function localDay(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function validDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function dayNumber(value) {
  if (!validDay(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function shiftDay(value, amount) {
  const number = dayNumber(value);
  return number === null ? "" : new Date((number + amount) * 86400000).toISOString().slice(0, 10);
}

export function recentDays(today, count = 7) {
  return Array.from({ length: count }, (_, i) => shiftDay(today, i - count + 1));
}
