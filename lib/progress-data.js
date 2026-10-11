const dailyTotals = new Set(['agua', 'pasos', 'actividad', 'paseo', 'fruta', 'calorias']);

// Manual corrections are deltas; device measurements are observations, not deltas.
export function chartSeries(history, type) {
  const records = history.filter(item => item.type === type && item.value !== '' && item.value != null)
    .map(item => ({...item, value: Number(item.value)}))
    .filter(item => Number.isFinite(item.value) && Number.isFinite(new Date(item.date).getTime()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!dailyTotals.has(type)) return records;
  const days = new Map();
  for (const record of records) {
    const day = new Date(record.date).toLocaleDateString('sv-SE');
    const current = days.get(day) || {date: day + 'T12:00:00', value: 0, sources: new Set()};
    current.value += record.value;
    current.sources.add(record.source || 'manual');
    days.set(day, current);
  }
  return [...days.values()].map(item => ({...item, value: +item.value.toFixed(3), source: [...item.sources].join(', ')}));
}

export function mergeDeviceRecord(history, record) {
  const index = history.findIndex(item => item.externalKey === record.externalKey);
  if (index < 0) return [record, ...history];
  if (history[index].value === record.value) return history;
  return history.map((item, i) => i === index ? {...record, id: item.id} : item);
}
