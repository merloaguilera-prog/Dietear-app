export const WEEK_DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
export const MEAL_FIELDS = [
  ["breakfast", "☕ Desayuno"],
  ["midmorning1", "🍐 Media mañana 1"],
  ["midmorning2", "🥛 Media mañana 2"],
  ["lunch", "🍽️ Almuerzo"],
  ["snack1", "🍏 Merienda 1"],
  ["snack2", "🥪 Merienda 2"],
  ["dinner", "🌙 Cena"]
];

function localDate(value) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12);
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function weekKeyFor(value = new Date()) {
  const monday = localDate(value);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return dateKey(monday);
}

export function shiftWeek(key, weeks) {
  const date = localDate(key);
  date.setDate(date.getDate() + weeks * 7);
  return dateKey(date);
}

export function datesForWeek(key) {
  return WEEK_DAYS.map((_, index) => {
    const date = localDate(key);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function emptyWeek(people = 1) {
  return WEEK_DAYS.map(day => ({
    day,
    ...Object.fromEntries(MEAL_FIELDS.map(([field]) => [field, ""])),
    people: Math.max(1, Number(people) || 1)
  }));
}

export function normalizeWeek(days, people = 1) {
  const blank = emptyWeek(people);
  if (!Array.isArray(days)) return blank;
  return blank.map((defaultDay, index) => {
    const saved = days[index] || {};
    return {
      ...defaultDay,
      ...Object.fromEntries(MEAL_FIELDS.map(([field]) => [field,
        field === "snack1" ? (saved.snack1 || saved.snack || "") : (saved[field] ?? "")
      ])),
      people: Math.max(1, Number(saved.people) || defaultDay.people)
    };
  });
}

export function moveToWeek({weekKey, planner, shopping, archive, people}, target) {
  if (target === weekKey) return {weekKey, planner, shopping, archive};
  const saved = archive[target];
  return {
    weekKey: target,
    planner: normalizeWeek(saved?.planner, people),
    shopping: saved?.shopping || [],
    archive: {...archive, [weekKey]: {planner, shopping}}
  };
}
