# Entrada ágil de datos — revisión del dictado

Al enfocar un campo editable aparece «Siguiente campo» y, si existe soporte,
«Dictar este dato». El aviso del servicio de voz se muestra antes de ese botón.
Una pulsación inicia el reconocimiento y solicita el permiso del navegador si
hace falta. Ya no hay un segundo inicio oculto tras una casilla.

«Activando micrófono» indica que se espera al servicio; «Escuchando» solo aparece
cuando el navegador confirma el inicio. Los resultados provisionales son visibles.
El resultado definitivo válido se introduce directamente en el mismo control de
React y activa el guardado que tenga esa sección. «Deshacer dictado» restaura el
valor anterior mientras no se haya editado después. El dictado no envía formularios
ni pulsa botones de guardar; en secciones con guardado explícito este se mantiene.

Se conservan los límites, formatos y opciones existentes. Un dato ambiguo no se
escribe y una edición manual concurrente nunca se sobrescribe. El micrófono se
cancela al cambiar de campo, cerrar la ayuda u ocultar la aplicación. Hay límites
para la activación (45 segundos) y la escucha (20 segundos). Los resultados
repetidos o tardíos no se aplican.

Se distinguen errores de permiso, captura de audio, falta de voz, conexión y
servicio no disponible. Se ofrece el micrófono del teclado como alternativa. El
servicio del navegador puede enviar el audio a su proveedor; DIETEAR no guarda
las grabaciones. No se añade un proveedor de transcripción propio ni permisos
nuevos al paquete Android.

La disponibilidad real sigue dependiendo del navegador y del teléfono. Pruebas
con eventos simulados o la presencia de un botón no acreditan una transcripción
real desde un micrófono físico.

Referencia: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
