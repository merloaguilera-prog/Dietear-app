# DIETEAR para Google Play

Base Android: Trusted Web Activity sobre `https://dietear.app`.

- Identificador definitivo: `com.dietear.app`
- Versión inicial: `1.0.0` (`versionCode` 1)
- Siguiente actualización: `1.0.3` (`versionCode` 4), preparada para Prueba cerrada → Alpha. El código 3 ya está publicado en pruebas.
- Android objetivo: API 36, exigido para nuevas aplicaciones desde el 31 de agosto de 2026.
- Dominio de producción: `dietear.app`
- Manifiesto Android/PWA: `android/twa-manifest.json`

## Generación del paquete

1. Instalar Java 17 y Android SDK 36.
2. Abrir `android/native/` con Android Studio o usar Gradle 9.4.1 (el repositorio no incluye wrapper).
3. Conservar la clave de carga existente: usar los secretos configurados en GitHub Actions; no crear ni sustituir la firma para esta actualización.
4. Generar el Android App Bundle firmado (`bundleRelease`).
5. Para esta actualización, usar exclusivamente Prueba cerrada → Alpha; mantener producción y los participantes actuales.
6. Contrastar las dos huellas existentes de `public/.well-known/assetlinks.json` con la clave de carga y Play App Signing.

Nunca se deben subir al repositorio la clave de firma, sus contraseñas ni las credenciales de Play Console.

## Elementos que exige Play Console

- Política de privacidad pública.
- Formulario de seguridad de datos coherente con los datos reales tratados.
- Declaración de contenido y clasificación por edades.
- Aviso claro: DIETEAR orienta sobre bienestar y no sustituye atención médica.
- Capturas reales de teléfono y recursos gráficos de la ficha.
- Prueba cerrada exigida por el tipo de cuenta antes de producción, cuando corresponda.

Para cuentas personales creadas después del 13 de noviembre de 2023, Google exige actualmente al menos 12 personas inscritas de forma continua durante 14 días antes de solicitar acceso a producción.

Preparado en este repositorio:

- Política pública: `/privacidad`.
- Texto de la ficha: `android/store-listing-es.md`.
- Borrador verificable de seguridad de datos: `android/data-safety-es.md`.

## Preparación del 25/11/2026

Ver [estado, evidencias y bloqueos](../docs/publicacion-2026-11-25.md) y [notas de versión](release-notes-es.txt).

La web y Google Play tienen estados independientes. En Play Console siguen siendo necesarios los requisitos del panel: el 25/11 mostraba 9 testers inscritos y la solicitud de producción desactivada. No se modifica la lista de personas ni se contacta con nadie desde este trabajo.

Fuentes de requisitos: [prueba cerrada](https://support.google.com/googleplay/android-developer/answer/14151465), [API objetivo](https://support.google.com/googleplay/android-developer/answer/11926878), [datos y privacidad](https://support.google.com/googleplay/android-developer/answer/10144311). Comprobarlas de nuevo al enviar y contrastar siempre el estado de la cuenta en Play Console.
