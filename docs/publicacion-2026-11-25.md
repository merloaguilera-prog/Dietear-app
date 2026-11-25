# Preparación de publicación · DIETEAR · 25/11/2026

## Web

- PR #51 fusionado en `main`: `fdd1d6cc41a28b66899cbebde9f7fb3325b0a288`.
- Vercel: despliegue de producción `dpl_DWN5NG7RUi3wgigQ3uCcQD4Rw9Nk`, estado READY. Dominio configurado: https://dietear.app.
- Código probado antes de fusionar: `199e37876bc49079ed799409e79c492b3b0b41de`. [Web checks #101](https://github.com/merloaguilera-prog/Dietear-app/actions/runs/45597885319): 87 pruebas unitarias, compilación y 34 recorridos E2E aprobados en escritorio y tamaño Pixel 5. El árbol de la fusión coincide con el probado.
- La compilación y las pruebas de la fusión están en [Web checks de main](https://github.com/merloaguilera-prog/Dietear-app/actions/runs/45599487869); consultar resultado final allí.
- Incluye objetivos múltiples, pasos y resumen semanal; fotografías grandes en inicio; acceso directo al libro elegido; ocho libros diferenciados; voz revisable y lectura; diario y gráficas conectados.

## Android y paquete

- Paquete conservado: `com.dietear.app`; Java 17, SDK objetivo 36, mínimo 24.
- Play Console muestra códigos 1, 2 y 3 ya subidos. Alpha activo: 1.0.2/código 3, publicado en octubre. No reutilizar código 3 para la corrección actual.
- Esta preparación eleva la siguiente versión a **1.0.3/código 4** en Gradle y Bubblewrap, con la misma firma y dominio.
- La regresión instala 1.0.1/código 2 minificada, reproduce el cierre, actualiza sin borrar datos y exige dos aperturas con DIETEAR visible. [Android build #74](https://github.com/merloaguilera-prog/Dietear-app/actions/runs/45597885278) pasó para el código 3 corregido; el código 4 debe obtener su propia evidencia antes de subirlo.
- Los AAB de pull requests están **sin firmar** y no se suben a Play. El flujo de `main` genera el AAB firmado con los secretos existentes; no crea una nueva clave. Nunca usar los APK de emulador como distribución.
- [Ficha española](../android/store-listing-es.md), [notas de versión](../android/release-notes-es.txt), [seguridad de datos](../android/data-safety-es.md), [instrucciones de compilación](../android/native/README.md).

## Estado observado en Play Console

Consulta de solo lectura del 25/11/2026, aplicación DIETEAR:

| Punto | Estado observado / acción pendiente |
| --- | --- |
| Acceso a producción | Inactivo; botón «Solicitar acceso a producción» desactivado |
| Testers | 9 inscritos; el panel pide al menos 12 durante 14 días continuos |
| Alpha | Activo, código 3; una región; no se cambian participantes ni países |
| Versiones | Códigos 1, 2 y 3; no hay código 4 subido en la consulta |
| Avisos Android de la versión antigua | Revisar vista de extremo a extremo y APIs obsoletas tras procesar el nuevo bundle |
| Estado de operador de la cuenta | Console solicita declaración antes de febrero de 2027; decisión de la titular |

No se contacta con testers ni se inventan respuestas sobre su uso. Las pruebas automáticas no sustituyen la elegibilidad de la cuenta ni prueban instalación desde Play en un móvil físico.

## Pendientes concretos antes del envío Android

1. Obtener el AAB **firmado de código 4**, identificar commit, artefacto y hash y completar su regresión.
2. Subirlo a Alpha como borrador, revisar errores de procesamiento, firma y códigos; conservar la lista de participantes.
3. Confirmar un contacto público de privacidad/soporte: la política actual remite al canal de la ficha, pero no proporciona directamente un contacto operativo. No inventar un correo.
4. Revisar proveedores activos, conservación y respuestas de Seguridad de datos contra producción. Las pruebas de IA/foto usan respuestas simuladas y no acreditan servicio real ni exactitud nutricional.
5. Confirmar capturas reales, clasificación, declaraciones de salud y el resultado de pruebas de Play para ese bundle. No anunciar cuentas/familia aislada, dispositivos conectados ni Pro/Billing completos.
6. Completar la elegibilidad mostrada por Console para solicitar producción. Mantener diferenciada la actualización de Alpha de la publicación pública.

## Referencias oficiales

- [Prueba cerrada y acceso a producción](https://support.google.com/googleplay/android-developer/answer/14151465).
- [SDK objetivo de Google Play](https://support.google.com/googleplay/android-developer/answer/11926878).
- [Datos de usuario y política de privacidad](https://support.google.com/googleplay/android-developer/answer/10144311).

Las condiciones dependen de la cuenta y pueden cambiar: prevalecen el estado real de Console y la documentación oficial al enviar.
