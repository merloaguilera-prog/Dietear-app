export const BLUETOOTH_METRICS = {
  peso: {service: 0x181d, characteristic: 0x2a9d, label: 'Peso', unit: 'kg'},
  pulso: {service: 0x180d, characteristic: 0x2a37, label: 'Pulso', unit: 'lpm'}
};

// Bluetooth SIG Weight Measurement (2A9D) and Heart Rate Measurement (2A37).
export function decodeMeasurement(type, view, receivedAt = new Date()) {
  if (!(view instanceof DataView) || view.byteLength < 2) throw Error('La lectura está incompleta.');
  const flags = view.getUint8(0);
  if (type === 'pulso') {
    if ((flags & 4) && !(flags & 2)) throw Error('El sensor no detecta contacto.');
    if ((flags & 1) && view.byteLength < 3) throw Error('La lectura está incompleta.');
    const value = flags & 1 ? view.getUint16(1, true) : view.getUint8(1);
    if (value <= 0 || value > 400) throw Error('El sensor no ha enviado un pulso válido.');
    return {type, value, date: receivedAt.toISOString()};
  }
  if (type !== 'peso' || view.byteLength < 3 || (flags & 0xf0)) throw Error('Formato de lectura no compatible.');
  const raw = view.getUint16(1, true);
  if (raw === 0xffff || raw === 0) throw Error('La báscula no ha completado la medición.');
  let offset = 3;
  let date = receivedAt;
  if (flags & 2) {
    if (view.byteLength < offset + 7) throw Error('La fecha de la lectura está incompleta.');
    const year = view.getUint16(offset, true), month = view.getUint8(offset + 2), day = view.getUint8(offset + 3);
    const hour = view.getUint8(offset + 4), minute = view.getUint8(offset + 5), second = view.getUint8(offset + 6);
    date = new Date(year, month - 1, day, hour, minute, second);
    if (year < 1900 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute || date.getSeconds() !== second || date.getTime() > receivedAt.getTime() + 300000) throw Error('Revisa la fecha y hora de tu báscula.');
    offset += 7;
  }
  let userId = null;
  if (flags & 4) {
    if (view.byteLength <= offset) throw Error('La identificación de la lectura está incompleta.');
    userId = view.getUint8(offset++);
  }
  if ((flags & 8) && view.byteLength < offset + 4) throw Error('La lectura está incompleta.');
  const value = +(raw * ((flags & 1) ? 0.01 * 0.45359237 : 0.005)).toFixed(3);
  return {type, value, date: date.toISOString(), userId, hasTimestamp: Boolean(flags & 2)};
}

export function deviceRecord(measurement, device, selectedUserId = '') {
  if (measurement.userId != null && (selectedUserId === '' || Number(selectedUserId) !== measurement.userId)) {
    throw Error('Esta lectura pertenece a un usuario de la báscula. Elige tu número de usuario antes de conectar.');
  }
  const metric = BLUETOOTH_METRICS[measurement.type];
  const minute = Math.floor(new Date(measurement.date).getTime() / 60000);
  const key = measurement.type === 'pulso' ? minute : `${measurement.date}:${measurement.value}`;
  // Scales without a clock can repeat an indication after reconnecting.
  const dedupKey = measurement.type === 'peso' && !measurement.hasTimestamp ? `${minute}:${measurement.value}` : key;
  return {...measurement, id: `ble:${device.id}:${measurement.type}:${dedupKey}`, externalKey: `ble:${device.id}:${measurement.type}:${dedupKey}`, source: 'bluetooth', deviceName: device.name || 'Dispositivo Bluetooth', label: `${metric.label} ${measurement.value} ${metric.unit} · Bluetooth`};
}
