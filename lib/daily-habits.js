import { localDay, recentDays, validDay } from "./local-day.js";

export const HABITS_KEY = "dietear-daily-habits";
export const HABITS_EVENT = "dietear:daily-updated";
export const HABIT_CHOICES = [
  { id: "water", label: "Cuidar mi hidratación", action: "Beber según mis necesidades y las indicaciones de mi profesional.", tab: "progreso", section: "Hidratación" },
  { id: "vegetables", label: "Añadir fruta o verdura", action: "Incluir una opción compatible con mis restricciones en una comida.", tab: "alimentacion", section: "¿Qué como hoy?" },
  { id: "walk", label: "Moverme a mi ritmo", action: "Reservar un rato de movimiento adaptado a mí.", tab: "progreso", section: "Pasos y actividad" },
  { id: "rest", label: "Cuidar mi descanso", action: "Anotar cómo he dormido y buscar un horario viable para mi rutina.", tab: "progreso", section: "Sueño y descanso" },
  { id: "fiber", label: "Elegir fibra alimentaria", action: "Incluir legumbres, integrales, fruta o verdura si son adecuados para mí.", tab: "alimentacion", section: "Todo Dietas" },
  { id: "strength", label: "Practicar fuerza adaptada", action: "Planificar una sesión ajustada a mi capacidad, sin dolor ni prisas.", tab: "progreso", section: "Pasos y actividad" },
  { id: "rescue", label: "Aprovechar mi nevera", action: "Revisar fechas y aprovechar primero lo que puedo consumir con seguridad.", tab: "alimentacion", section: "Mi Nevera" },
];
const ids = new Set(HABIT_CHOICES.map(item => item.id));
const clean = value => Array.isArray(value) ? [...new Set(value.filter(id => ids.has(id)))] : [];

export function normalizeHabits(raw, today = localDay()) {
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const days = {};
  if (input.version === 2 && input.days && typeof input.days === "object") {
    for (const [day, entry] of Object.entries(input.days)) {
      if (!validDay(day) || !entry || typeof entry !== "object") continue;
      const planned = clean(entry.planned);
      days[day] = { planned, completed: clean(entry.completed), reviewed: entry.reviewed === true };
    }
  } else if (validDay(input.day) && Array.isArray(input.items)) {
    // Preserve old check marks as observations; do not invent old objectives.
    days[input.day] = { planned: [], completed: clean(input.items), reviewed: false };
  }
  const active = clean(input.active).slice(0, 3);
  return { version: 2, active, days, day: today, items: days[today]?.completed || [] };
}

export function updateHabitDay(raw, today, { active, toggle, review } = {}) {
  const state = normalizeHabits(raw, today);
  const chosen = active === undefined ? state.active : clean(active).slice(0, 3);
  const old = state.days[today] || { planned: [], completed: [], reviewed: false };
  const completed = toggle && chosen.includes(toggle)
    ? old.completed.includes(toggle) ? old.completed.filter(id => id !== toggle) : [...old.completed, toggle]
    : old.completed;
  const entry = { planned: chosen, completed, reviewed: review === true || old.reviewed || !!toggle };
  return { ...state, active: chosen, days: { ...state.days, [today]: entry }, day: today, items: completed };
}

export function habitWeek(raw, today = localDay()) {
  const state = normalizeHabits(raw, today);
  return recentDays(today).map(day => {
    const entry = state.days[day];
    const completed = entry?.planned.filter(id => entry.completed.includes(id)).length || 0;
    const total = entry?.planned.length || 0;
    return { day, total, completed, status: !entry?.reviewed || !total ? "Sin evaluar" : completed === total ? "Logrado" : completed ? "Parcialmente logrado" : "Reajustar" };
  });
}
