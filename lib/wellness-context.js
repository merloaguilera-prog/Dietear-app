// Rest diaries are local by default. Do not silently add them to a consultation
// when the person asks an unrelated question. Explicit text they type is unchanged.
export function consultationHistory(history) {
  return history.filter(item => item.type !== "bienestar" && !item.sleepStart && !item.sleepEnd);
}
