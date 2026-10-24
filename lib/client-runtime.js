// Browser storage can be unavailable or full even when reads succeeded.
export function writeLocalJson(key, value) {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function tabForSearch(search) {
  const section = new URLSearchParams(search).get("section");
  switch (section) {
    case "food": return "alimentacion";
    case "plan": return "plan";
    case "progress": return "progreso";
    default: return null;
  }
}

export function normalizeRestriction(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function matchesRestriction(meal, terms) {
  const text = normalizeRestriction(meal);
  return terms.some(term => {
    const escaped = normalizeRestriction(term).replace(/[.*+?^$}{()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    return new RegExp("(^|[^a-z0-9])" + escaped + "(?:s|es)?([^a-z0-9]|$)", "i").test(text);
  });
}
