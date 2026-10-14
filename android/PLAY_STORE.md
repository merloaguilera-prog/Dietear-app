# DIETEAR para Google Play

Base Android: Trusted Web Activity sobre `https://dietear.app`.

- Identificador definitivo: `com.dietear.app`
- Versión inicial: `1.0.0` (`versionCode` 1)
- Dominio de producción: `dietear.app`
- Manifiesto Android/PWA: `android/twa-manifest.json`

## Generación del paquete

1. Instalar Java 17, Android SDK y Bubblewrap CLI.
2. Desde `android/`, inicializar el proyecto usando `twa-manifest.json`.
3. Crear una clave de firma de Play y guardarla fuera del repositorio.
4. Generar el Android App Bundle firmado (`.aab`).
5. Publicar primero en la pista de pruebas internas de Google Play.
6. Añadir la huella SHA-256 de la firma a `public/.well-known/assetlinks.json`.

Nunca se deben subir al repositorio la clave de firma, sus contraseñas ni las credenciales de Play Console.

## Elementos que exige Play Console

- Política de privacidad pública.
- Formulario de seguridad de datos coherente con los datos reales tratados.
- Declaración de contenido y clasificación por edades.
- Aviso claro: DIETEAR orienta sobre bienestar y no sustituye atención médica.
- Capturas reales de teléfono y recursos gráficos de la ficha.
- Prueba cerrada exigida por el tipo de cuenta antes de producción, cuando corresponda.

Preparado en este repositorio:

- Política pública: `/privacidad`.
- Texto de la ficha: `android/store-listing-es.md`.
- Borrador verificable de seguridad de datos: `android/data-safety-es.md`.
