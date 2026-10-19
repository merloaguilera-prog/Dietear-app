import { dayNumber, localDay, recentDays } from "./local-day.js";

export function sleepSession({ start, end, quality = "", energy = "" }, now = new Date()) {
  const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!pattern.test(start || "") || !pattern.test(end || "")) return { error: "Indica fecha y hora de inicio y de fin." };
  const from = new Date(start), to = new Date(end);
  // Round-trip catches invalid dates and nonexistent times during a DST change.
  const sameLocal = (date, input) => `${localDay(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` === input;
  if (!sameLocal(from, start) || !sameLocal(to, end)) return { error: "Revisa las fechas y horas: alguna no existe en tu zona horaria." };
  const minutes = (to - from) / 60000;
  if (minutes <= 0 || minutes > 1440) return { error: "El fin debe ser posterior al inicio y la sesión no puede superar 24 horas." };
  if (to > now) return { error: "Registra descanso ya realizado, no una sesión futura." };
  if (!["Reparador", "Intermedio", "Poco reparador"].includes(quality) || !["Baja", "Media", "Alta"].includes(energy)) return { error: "Selecciona cómo has descansado y tu energía." };
  return { value: Math.round(minutes / 6) / 10, sleepDate: localDay(to), sleepStart: from.toISOString(), sleepEnd: to.toISOString(), quality, energy, source: "manual" };
}

export function saveSleepRecord(history, session) {
  // The main rest period is one editable record per wake-up date; preserve legacy entries.
  const item = { ...session, id: `sleep:manual:${session.sleepDate}`, type: "bienestar", date: session.sleepEnd, label: `Descanso registrado ${session.value} h · ${session.quality} · energía ${session.energy}` };
  return [item, ...history.filter(record => record.id !== item.id)];
}

export function sleepWeek(history, today = localDay()) {
  const days = new Set(recentDays(today));
  const records = history.filter(record => record.type === "bienestar" && days.has(record.sleepDate) && Number.isFinite(Number(record.value)) && record.sleepStart && record.sleepEnd);
  const unique = [...new Map(records.map(record => [record.sleepDate, record])).values()];
  const average = unique.length ? unique.reduce((sum, record) => sum + Number(record.value), 0) / unique.length : null;
  const times = unique.map(record => new Date(record.sleepStart)).filter(date => Number.isFinite(date.getTime())).map(date => date.getHours() * 60 + date.getMinutes()).sort((a, b) => a - b);
  let spreadMinutes = null;
  if (times.length >= 3) {
    const gaps = times.map((time, i) => (times[(i + 1) % times.length] + (i === times.length - 1 ? 1440 : 0)) - time);
    spreadMinutes = 1440 - Math.max(...gaps);
  }
  return { records: unique.sort((a, b) => dayNumber(b.sleepDate) - dayNumber(a.sleepDate)), count: unique.length, average, spreadMinutes };
}
