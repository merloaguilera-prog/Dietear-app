import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeMeasurement, deviceRecord} from '../lib/bluetooth-data.js';
import {chartSeries, mergeDeviceRecord} from '../lib/progress-data.js';
import {saveState, loadState} from '../lib/dietear-store.js';

const view = bytes => new DataView(Uint8Array.from(bytes).buffer);
const receivedAt = new Date('2026-10-11T08:00:00Z');
const scale = {id: 'scale-test', name: 'Báscula de prueba'};

test('BLE kilograms enter the same graph as manual data and survive reload', () => {
  const incoming = deviceRecord(decodeMeasurement('peso', view([0, 0xa0, 0x5f]), receivedAt), scale);
  assert.equal(incoming.value, 122.4);
  const manual = {id: 'manual', type: 'peso', value: 123, date: '2026-10-10T08:00:00Z', source: 'manual'};
  const history = mergeDeviceRecord([manual], incoming);
  assert.equal(mergeDeviceRecord(history, incoming), history);
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = {setItem: (key, value) => storage.set(key, value), getItem: key => storage.get(key)};
  saveState({history});
  const restored = loadState();
  assert.deepEqual(chartSeries(restored.history, 'peso').map(x => x.value), [123, 122.4]);
  assert.equal(restored.history[0].source, 'bluetooth');
  assert.equal(restored.history[0].deviceName, scale.name);
  delete globalThis.window; delete globalThis.localStorage;
});

test('imperial weights convert to kg and unsuccessful or truncated readings are rejected', () => {
  assert.equal(decodeMeasurement('peso', view([1, 0x20, 0x4e]), receivedAt).value, 90.718);
  for (const bytes of [[0], [0, 0xff, 0xff], [2, 0x20, 0x4e], [8, 0x20, 0x4e], [0, 0, 0]]) {
    assert.throws(() => decodeMeasurement('peso', view(bytes), receivedAt));
  }
});

test('scale timestamps retain the measurement date and isolate scale user IDs', () => {
  const measurement = decodeMeasurement('peso', view([6, 0xa0, 0x5f, 0xea, 7, 10, 9, 12, 0, 0, 3]), receivedAt);
  assert.equal(new Date(measurement.date).getDate(), 9);
  assert.throws(() => deviceRecord(measurement, scale));
  assert.throws(() => deviceRecord(measurement, scale, '2'));
  assert.equal(deviceRecord(measurement, scale, '3').userId, 3);
  const badDate = [2, 0xa0, 0x5f, 0xea, 7, 2, 31, 12, 0, 0];
  assert.throws(() => decodeMeasurement('peso', view(badDate), receivedAt));
});

test('pulse flags, poor contact and repeated notifications', () => {
  assert.equal(decodeMeasurement('pulso', view([0, 72]), receivedAt).value, 72);
  assert.equal(decodeMeasurement('pulso', view([1, 0x2c, 1]), receivedAt).value, 300);
  assert.throws(() => decodeMeasurement('pulso', view([4, 72]), receivedAt));
  assert.throws(() => decodeMeasurement('pulso', view([1, 72]), receivedAt));
  const first = deviceRecord(decodeMeasurement('pulso', view([0, 72]), receivedAt), scale);
  const second = deviceRecord(decodeMeasurement('pulso', view([0, 74]), receivedAt), scale);
  assert.equal(mergeDeviceRecord([first], second).length, 1);
  assert.equal(chartSeries(mergeDeviceRecord([first], second), 'pulso')[0].value, 74);
});

test('daily totals include corrections, separate dates, and never invent missing data', () => {
  const history = [
    {type: 'agua', value: 0.5, date: '2026-10-10T12:00:00Z'},
    {type: 'agua', value: 0.25, date: '2026-10-10T13:00:00Z'},
    {type: 'agua', value: -0.25, date: '2026-10-10T14:00:00Z'},
    {type: 'agua', value: 1, date: '2026-10-11T12:00:00Z'},
    {type: 'agua', value: '', date: '2026-10-11T12:00:00Z'},
    {type: 'agua', value: 1, date: 'invalid'}
  ];
  assert.deepEqual(chartSeries(history, 'agua').map(x => x.value), [0.5, 1]);
  assert.deepEqual(chartSeries(history, 'pasos'), []);
});
