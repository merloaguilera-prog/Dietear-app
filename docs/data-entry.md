# Entrada ágil de datos

Al enfocar un campo de texto, número, fecha, hora o una lista de selección simple,
DIETEAR muestra «Siguiente campo» y, si el navegador lo admite, «Dictar este dato».
El avance recorre los campos visibles y editables de la pantalla actual, sin
activar botones de envío ni pulsar automáticamente «Guardar». Las contraseñas,
archivos, controles ocultos y campos bloqueados quedan excluidos.

El usuario activa el servicio de voz del navegador tras leer el aviso de audio.
Solo escucha al pulsarlo, en español, durante un máximo de 20 segundos. No se
reinicia automáticamente. Se detiene al cambiar de campo, cerrar la ayuda,
ocultar la aplicación o desmontar la pantalla. DIETEAR no almacena grabaciones;
el proveedor del navegador puede procesar audio en sus servidores.

El texto reconocido se presenta antes de usarlo. «Usar y siguiente» actualiza el
mismo campo y sus manejadores existentes, conserva el resto del formulario y
avanza. Si el usuario ha escrito mientras tanto, el dictado no lo sobrescribe.
Los valores incompatibles con el formato/límites se rechazan sin modificar el
valor anterior. Se admiten números españoles con coma, centímetros y kilos;
las listas exigen una opción existente. Las fechas y horas mantienen su selector
nativo; un dictado ambiguo invita a usarlo manualmente.

Compatibilidad: la disponibilidad de voz depende del navegador, conexión y
permisos. En navegadores sin SpeechRecognition se conserva escritura y avance,
y se indica la alternativa del micrófono del teclado móvil. No añade permisos
al AAB ni garantiza voz en todos los teléfonos.

Referencia: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
