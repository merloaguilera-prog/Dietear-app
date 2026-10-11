# Gráficas y datos personales — 11 octubre 2026

Los registros manuales y las lecturas Bluetooth directas alimentan `history` y se guardan con el estado existente en este navegador. No hay sincronización en la nube ni recepción en segundo plano.

- Cambiar el peso de Mi ficha y salir del campo registra su valor; la referencia del perfil sigue el peso más reciente del historial.
- Las gráficas suman por día agua, pasos, actividad, paseo, raciones y calorías registradas. Peso, medidas, sueño y pulso conservan sus observaciones.
- Bluetooth admite servicios estándar Weight Scale (181D/2A9D) y Heart Rate (180D/2A37). Las notificaciones se incorporan sin pulsar Guardar. Las lecturas de pulso actualizan un punto por minuto y dispositivo; no son medias ni un registro clínico continuo.
- Las básculas con varios usuarios requieren elegir el identificador que corresponde a la persona. Las lecturas de otros usuarios no se importan.
- Se conservan fecha, origen y nombre del dispositivo. Peso en libras se convierte a kg. Se rechazan lecturas incompletas, fallidas o con fechas inválidas; las retransmisiones no duplican el historial.
- Conectar requiere acción y permiso del usuario en un navegador compatible. Cambiar de sección conserva la conexión; cerrar DIETEAR, salir de su página o desconectar detiene la recepción. Las lecturas recibidas permanecen guardadas.
- Apple Salud, Health Connect y las apps de fabricantes siguen pendientes. No se atribuye compatibilidad a ningún modelo comercial ni se importan pasos/sueño desde un sensor de peso/pulso.

Validación: `TZ=Europe/Madrid node --test tests/progress-bluetooth.test.mjs` prueba bytes BLE → registro → persistencia/recarga → gráfica, conversión de unidades, fechas, separación por usuario, deduplicación y totales diarios. Compilación Next.js. No se ha conectado hardware real: faltan permisos/emparejamiento y lecturas en móvil para confirmar la integración física.

Referencias: https://developer.chrome.com/docs/capabilities/bluetooth y especificaciones Bluetooth SIG Weight Scale Service 1.0.1 y Heart Rate Service 1.0.

## Referencias de aplicaciones existentes

- Cronometer registra biometrías manuales e importadas para sus gráficas y ofrece diagnósticos de sincronización. DIETEAR incorpora un historial común y estados de conexión/espera/error; la integración con nubes de fabricantes sigue pendiente. https://support.cronometer.com/hc/en-us/articles/360018302431-Add-a-Biometric y https://support.cronometer.com/hc/en-us/articles/360020355032-Device-Troubleshooting
- MyFitnessPal permite elegir el origen de pasos y evita el doble cómputo de actividad. DIETEAR incorpora trazabilidad/filtro Manual/Bluetooth y deduplicación de sus lecturas directas. La fusión de pasos entre distintas apps requiere una integración futura; no está implementada. https://support.myfitnesspal.com/hc/en-us/articles/360032273612-How-step-tracking-works-in-MyFitnessPal
- Google Fit centraliza datos de apps mediante Health Connect en Android. DIETEAR lo muestra como integración pendiente para la app Android. No se ofrece como conexión web activa. https://support.google.com/fit/faq/6108483?hl=en

Se adaptan patrones funcionales con implementación propia.
