# Proyecto Android de DIETEAR

Proyecto TWA nativo preparado para `com.dietear.app`, API 36 y Java 17.

## Estado verificable

- El manifiesto declara únicamente permiso de Internet.
- Los enlaces HTTPS de `dietear.app` están preparados para App Links.
- No contiene claves, contraseñas ni archivos de firma.
- La compilación de producción consume la clave exclusivamente mediante secretos de GitHub Actions.
- La dependencia oficial es Android Browser Helper 2.7.4.

## Generar el AAB

El flujo `Android build` de GitHub Actions compila automáticamente un APK de
pruebas y un AAB de release sin firmar con Java 17, Gradle 9.4.1 y Android API
36. Esto verifica el proyecto sin guardar claves en el repositorio. El AAB sin
firmar no se puede publicar en Google Play.

1. Instalar Android SDK 36 y Gradle 9.4.1 o abrir el proyecto con Android Studio compatible.
2. Configurar una clave de carga fuera del repositorio mediante las propiedades
   `DIETEAR_SIGNING_STORE_FILE`, `DIETEAR_SIGNING_STORE_PASSWORD`,
   `DIETEAR_SIGNING_KEY_ALIAS` y `DIETEAR_SIGNING_KEY_PASSWORD`.
3. Ejecutar `bundleRelease`; Gradle firmará el AAB cuando estén presentes las cuatro propiedades.
4. Obtener la huella SHA-256 de la firma definitiva de Play App Signing.
5. Publicar esa huella en `https://dietear.app/.well-known/assetlinks.json`.
6. Instalar una compilación de prueba y verificar que se abre sin barra del navegador.

La huella incluida actualmente en `assetlinks.json` corresponde a la clave de
subida y permite verificar instalaciones firmadas directamente con ella. Antes
de distribuir desde Google Play hay que añadir también la huella del certificado
de **firma de la aplicación** que proporciona Play App Signing; no debe
confundirse con la clave de subida.

No se debe considerar terminado hasta compilar, firmar e instalar el paquete en un dispositivo Android real.

## Secretos del repositorio

El flujo de GitHub Actions exige estos cuatro secretos fuera de pull requests:

- `DIETEAR_UPLOAD_KEYSTORE_BASE64`
- `DIETEAR_UPLOAD_STORE_PASSWORD`
- `DIETEAR_UPLOAD_KEY_ALIAS`
- `DIETEAR_UPLOAD_KEY_PASSWORD`

La clave se reconstruye únicamente en el directorio temporal del runner, con permisos restrictivos,
y nunca se añade al repositorio ni a los artefactos del flujo.
