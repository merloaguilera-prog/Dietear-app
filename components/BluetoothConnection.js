"use client";
import {useEffect, useRef, useState} from 'react';
import {BLUETOOTH_METRICS, decodeMeasurement, deviceRecord} from '../lib/bluetooth-data';

export default function BluetoothConnection({onRecord, onCharts}) {
  const [supported, setSupported] = useState(false);
  const [type, setType] = useState('peso');
  const [userId, setUserId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState('');
  const [last, setLast] = useState(null);
  const session = useRef(null), attempt = useRef(0), recordHandler = useRef(onRecord);
  recordHandler.current = onRecord;

  function release() {
    const current = session.current;
    session.current = null;
    if (!current) return;
    clearTimeout(current.timer);
    current.characteristic?.removeEventListener('characteristicvaluechanged', current.receive);
    current.device.removeEventListener('gattserverdisconnected', current.disconnected);
    if (current.device.gatt.connected) current.device.gatt.disconnect();
  }
  useEffect(() => {
    setSupported(Boolean(window.isSecureContext && navigator.bluetooth?.requestDevice));
    return () => {attempt.current++; release();};
  }, []);

  async function connect() {
    if (!confirmed) return;
    if (userId !== '' && (!/^\d+$/.test(userId) || Number(userId) > 255)) {
      setNotice('El número de usuario debe ser un entero entre 0 y 255.'); return;
    }
    const token = ++attempt.current;
    setStatus('connecting'); setNotice(''); setLast(null);
    const metric = BLUETOOTH_METRICS[type];
    let device;
    try {
      device = await navigator.bluetooth.requestDevice({filters: [{services: [metric.service]}]});
      if (token !== attempt.current) return;
      const current = {device};
      session.current = current;
      current.timer = setTimeout(() => {
        if (session.current !== current) return;
        attempt.current++; release(); setStatus('idle');
        setNotice('La conexión ha tardado demasiado. Acerca el dispositivo y vuelve a intentarlo.');
      }, 25000);
      current.disconnected = () => {
        if (session.current !== current) return;
        attempt.current++; release(); setStatus('idle');
        setNotice('Dispositivo desconectado. Tus registros ya recibidos siguen guardados.');
      };
      device.addEventListener('gattserverdisconnected', current.disconnected);
      const server = await device.gatt.connect();
      if (token !== attempt.current) {device.gatt.disconnect(); return;}
      const service = await server.getPrimaryService(metric.service);
      if (token !== attempt.current) return;
      const characteristic = await service.getCharacteristic(metric.characteristic);
      if (token !== attempt.current) return;
      current.characteristic = characteristic;
      current.receive = event => {
        if (session.current !== current) return;
        try {
          const record = deviceRecord(decodeMeasurement(type, event.target.value), device, userId);
          recordHandler.current(record); setLast(record); setNotice('');
        } catch (error) {setNotice(error.message);}
      };
      characteristic.addEventListener('characteristicvaluechanged', current.receive);
      await characteristic.startNotifications();
      if (token !== attempt.current) return;
      clearTimeout(current.timer);
      setStatus('connected');
    } catch (error) {
      if (token !== attempt.current) return;
      release(); setStatus('idle');
      setNotice(error.name === 'NotFoundError' ? 'No se ha conectado un dispositivo. Puedes volver a intentarlo.' : 'No se pudo conectar. Comprueba que el dispositivo está cerca, encendido y libre para conectarse.');
    }
  }
  function disconnect() {attempt.current++; release(); setStatus('idle'); setNotice('Conexión detenida. Los datos recibidos siguen en tus gráficas.');}
  const busy = status !== 'idle';
  return <section className="bluetoothConnection">
    <h3>Bluetooth directo a tus gráficas</h3>
    <p>Recibe peso de básculas compatibles o pulso de sensores compatibles. Cada lectura se guarda con su fecha y origen en tu historial personal.</p>
    <label>Dato que quieres recibir<select value={type} disabled={busy} onChange={e => {setType(e.target.value); setLast(null);}}><option value="peso">Peso · kg</option><option value="pulso">Pulso · latidos/minuto</option></select></label>
    {type === 'peso' && <label>Número de usuario de la báscula, si tiene varios<input type="number" min="0" max="255" step="1" value={userId} disabled={busy} onChange={e => setUserId(e.target.value)} placeholder="Déjalo vacío si es de un solo usuario"/></label>}
    <label className="bluetoothConsent"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)}/> Estas mediciones son mías y quiero guardarlas automáticamente en mi historial.</label>
    {supported ? <div className="branchActions"><button type="button" disabled={!confirmed || busy} onClick={connect}>{status === 'connecting' ? 'Conectando…' : status === 'connected' ? 'Conectado · esperando lecturas' : 'Conectar dispositivo'}</button>{busy && <button type="button" onClick={disconnect}>Desconectar</button>}</div> : <p>La conexión directa requiere un navegador compatible con Bluetooth, como Chrome en Android, y permiso para el dispositivo. Puedes seguir registrando tus datos manualmente.</p>}
    <p role="status" aria-live="polite">{last ? `${last.deviceName}: ${last.value} ${BLUETOOTH_METRICS[last.type].unit} · ${new Date(last.date).toLocaleString('es-ES')} · guardado en tus gráficas.` : status === 'connected' ? 'Esperando una medición del dispositivo…' : ''}</p>
    {notice && <p role="alert">{notice}</p>}
    <button type="button" onClick={onCharts}>Ver mis gráficas →</button>
    <p><small>La recepción funciona mientras DIETEAR y la conexión estén abiertas en esta pestaña, aunque cambies de sección. Pasos, sueño y dispositivos con protocolos propios necesitan su integración específica; todavía no se importan desde sus apps.</small></p>
  </section>;
}
