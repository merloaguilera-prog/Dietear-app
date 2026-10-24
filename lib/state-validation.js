const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const text = value => typeof value === "string";
const scalar = value => value == null || ["string", "number", "boolean"].includes(typeof value);
const dateKey = value => {
  if (!text(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const meals = ["breakfast", "midmorning1", "midmorning2", "lunch", "snack", "snack1", "snack2", "dinner"];
function shopping(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => record(item) && (text(item.name) || text(item.text)) && (item.name == null || text(item.name)) && (item.text == null || text(item.text))).map(item => ({
    ...item,
    ...(item.days !== undefined && (!Array.isArray(item.days) || !item.days.every(text)) ? {days: []} : {}),
  }));
}
function planner(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    if (!record(item)) return {};
    const clean = {...item};
    for (const field of meals) if (clean[field] != null && !text(clean[field])) clean[field] = "";
    return clean;
  });
}
function profile(value) {
  if (!record(value)) return {};
  const clean = {...value};
  // These values are read as text by input controls and restriction matching.
  const fields = ["name", "goal", "activity", "motivation", "dietStyle", "avoid", "allergens", "intolerances", "likes", "dislikes", "healthNotes", "healthArea", "workActivity"];
  for (const key of fields) {
    if (clean[key] != null && !text(clean[key])) clean[key] = scalar(clean[key]) ? String(clean[key]) : "";
  }
  if (clean.familyMembers !== undefined) {
    clean.familyMembers = Array.isArray(clean.familyMembers) ? clean.familyMembers.filter(record).map(member => {
      const person = {...member};
      for (const key of ["name", "allergens", "avoid"]) if (!text(person[key])) person[key] = "";
      return person;
    }) : [];
  }
  if (clean.healthTrackedAreas !== undefined) clean.healthTrackedAreas = Array.isArray(clean.healthTrackedAreas) ? clean.healthTrackedAreas.filter(text) : [];
  if (clean.healthAreaRecords !== undefined) clean.healthAreaRecords = Array.isArray(clean.healthAreaRecords) ? clean.healthAreaRecords.filter(record) : [];
  for (const key of ["clinicalContext", "healthAreaDetails", "healthAreaNotes"]) {
    if (clean[key] !== undefined && !record(clean[key])) clean[key] = {};
  }
  if (clean.clinicalContext) clean.clinicalContext = Object.fromEntries(Object.entries(clean.clinicalContext).filter(([, item]) => record(item)));
  return clean;
}
export function sanitizeSavedState(value) {
  if (!record(value)) return {};
  const clean = {...value};
  if (clean.goals != null && !(Array.isArray(clean.goals) && clean.goals.length === 4 && clean.goals.every(g => Array.isArray(g) && text(g[0]) && text(g[1]) && Number.isFinite(g[2]) && Number.isFinite(g[3]) && g[3] > 0 && text(g[4])))) delete clean.goals;
  if (clean.shopping != null) clean.shopping = shopping(clean.shopping);
  if (clean.fridge != null) clean.fridge = Array.isArray(clean.fridge) ? clean.fridge.filter(item => record(item) && text(item.name)) : [];
  for (const key of ["history", "careRecords"]) {
    if (clean[key] != null) clean[key] = Array.isArray(clean[key]) ? clean[key].filter(item => record(item) && text(item.type) && text(item.date) && Number.isFinite(new Date(item.date).getTime()) && (item.label == null || text(item.label)) && (item.text == null || text(item.text))) : [];
  }
  if (clean.planner != null) clean.planner = planner(clean.planner);
  if (clean.profile != null) clean.profile = profile(clean.profile);
  for (const key of ["dayKey", "weekKey"]) if (clean[key] != null && !dateKey(clean[key])) delete clean[key];
  if (clean.weekArchive != null) {
    clean.weekArchive = record(clean.weekArchive) ? Object.fromEntries(
      Object.entries(clean.weekArchive).filter(([key, item]) => dateKey(key) && record(item))
        .map(([key, item]) => [key, {...item, ...(item.planner != null ? {planner: planner(item.planner)} : {}), ...(item.shopping != null ? {shopping: shopping(item.shopping)} : {})}]),
    ) : {};
  }
  return clean;
}
