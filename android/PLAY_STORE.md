# DIETEAR para Google Play

Base Android: Trusted Web Activity sobre `https://dietear.app`.

- Identificador definitivo: `com.dietear.app`
- Versión inicial: `1.0.0` (`versionCode` 1)
- Corrección de arranque: `1.0.2` (`versionCode` 3), preparada para Prueba cerrada → Alpha.
- Android objetivo: API 36, exigido para nuevas aplicaciones desde el 31 de agosto de 2026.
- Dominio de producción: `dietear.app`
- Manifiesto Android/PWA: `android/twa-manifest.json`

## Generación del paquete

1. Instalar Java 17 y Android SDK 36.
2. Abrir `android/native/` con Android Studio o ejecutar su Gradle Wrapper.
3. Crear una clave de firma de Play y guardarla fuera del repositorio.
4. Generar el Android App Bundle firmado (`bundleRelease`).
5. Para esta actualización, usar exclusivamente Prueba cerrada → Alpha; mantener producción y los participantes actuales.
6. Añadir la huella SHA-256 de la firma a `public/.well-known/assetlinks.json`.

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
