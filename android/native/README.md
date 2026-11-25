# Proyecto Android de DIETEAR

Proyecto TWA nativo preparado para `com.dietear.app`, API 36 y Java 17.

## Estado verificable

- El manifiesto declara únicamente permiso de Internet.
- Los enlaces HTTPS de `dietear.app` están preparados para App Links.
- No contiene claves, contraseñas ni archivos de firma.
- La compilación de producción consume la clave exclusivamente mediante secretos de GitHub Actions.
- La dependencia oficial es Android Browser Helper 2.7.4.

## Actualización 1.0.3 (código 4)

Android Browser Helper 2.7.4 llama a `ManageDataLauncherActivity.addSiteSettingsShortcut` al arrancar y activa/desactiva ese componente mediante PackageManager. La librería no declara esa actividad en su AAR; debe declararla la aplicación. Su ausencia en 1.0.1 provoca `IllegalArgumentException` aunque R8 conserve los nombres.

El manifiesto registra ahora esa actividad, su URL de gestión y `manageSpaceActivity`, siguiendo el ejemplo oficial de Google. Se conserva la firma de subida existente, el identificador y las reglas de R8. La corrección se prepara para **Prueba cerrada → Alpha**, sin producción ni cambios de participantes.

Con la `LauncherActivity` base, eliminar el componente mantiene el fallo: el código de la librería intenta cambiar su estado incluso cuando el navegador no admite los ajustes. `enableSiteSettingsShortcut` queda activado en la configuración de Bubblewrap para mantener las regeneraciones coherentes con el proyecto nativo. CI exige que las dos actividades y los metadatos estén presentes en los manifiestos fusionados de debug y release.

El flujo también se ejecuta en `codex/android-startup-shortcuts` para generar el AAB firmado de esta corrección sin fusionar cambios en producción. Los pull requests siguen sin acceder a secretos de firma. El trabajo del emulador no recibe secretos: usa dos APK de release minificados, vueltos a firmar con una clave temporal de pruebas. El AAB de Play mantiene la clave de subida original.

La prueba de regresión construye la base 1.0.1 del commit `1dcf5a935d079291b4049f8baff88c85e8b14264`, reproduce el fallo, instala 1.0.3 con `adb install -r`, comprueba un marcador de datos privados y exige dos aperturas con contenido DIETEAR visible en Android 16. No equivale a verificar la instalación desde Google Play en el móvil de la usuaria.

La comprobación visual combina el texto de accesibilidad con píxeles reales de la zona central de la página en dos fotogramas consecutivos. Una superficie blanca no cuenta como apertura correcta. El emulador usa el backend `software` vigente y 3 GB de RAM; se conservan capturas y métricas como evidencia.

Fuentes oficiales: [actividad y requisito de manifiesto](https://github.com/GoogleChrome/android-browser-helper/blob/main/androidbrowserhelper/src/main/java/com/google/androidbrowserhelper/trusted/ManageDataLauncherActivity.java), [manifiesto del ejemplo TWA](https://github.com/GoogleChrome/android-browser-helper/blob/main/demos/twa-basic/src/main/AndroidManifest.xml).

La revisión de Play Console del 25/11/2026 confirma que 1.0.2/código 3 ya está subido desde octubre. Esta corrección usa 1.0.3/código 4 para evitar que Play rechace reutilizar un código. La firma y el paquete se conservan. El flujo #74 validó la corrección anterior en emulador; el código 4 exige su nueva ejecución.

## Generar el AAB

El flujo `Android build` de GitHub Actions compila con Java 17, Gradle 9.4.1 y
Android API 36. Los pull requests generan un AAB de release sin firmar; los
eventos de push autorizados generan el AAB firmado usando los secretos del
repositorio. El AAB sin firmar no se puede publicar en Google Play.

1. Instalar Android SDK 36 y Gradle 9.4.1 o abrir el proyecto con Android Studio compatible.
2. Configurar una clave de carga fuera del repositorio mediante las propiedades
   `DIETEAR_SIGNING_STORE_FILE`, `DIETEAR_SIGNING_STORE_PASSWORD`,
   `DIETEAR_SIGNING_KEY_ALIAS` y `DIETEAR_SIGNING_KEY_PASSWORD`.
3. Ejecutar `bundleRelease`; Gradle firmará el AAB cuando estén presentes las cuatro propiedades.
4. Obtener la huella SHA-256 de la firma definitiva de Play App Signing.
5. Publicar esa huella en `https://dietear.app/.well-known/assetlinks.json`.
6. Instalar una compilación de prueba y verificar que se abre sin barra del navegador.

`assetlinks.json` incluye las huellas de carga y de firma de aplicación registradas en el proyecto. Deben contrastarse con Integridad de la app en Play Console; no sustituirlas al regenerar el paquete ni confundir la clave de carga con Play App Signing.

No se debe considerar terminado hasta compilar, firmar e instalar el paquete en un dispositivo Android real.

## Secretos del repositorio

El flujo de GitHub Actions exige estos cuatro secretos fuera de pull requests:

- `DIETEAR_UPLOAD_KEYSTORE_BASE64`
- `DIETEAR_UPLOAD_STORE_PASSWORD`
- `DIETEAR_UPLOAD_KEY_ALIAS`
- `DIETEAR_UPLOAD_KEY_PASSWORD`

La clave se reconstruye únicamente en el directorio temporal del runner, con permisos restrictivos,
y nunca se añade al repositorio ni a los artefactos del flujo.

## Desarrollo #51 (22/11/2026)

La aplicación Android es una TWA: el contenido web se sirve desde la URL de
`strings.xml`. Esta rama conserva paquete, versión 1.0.3/código 4 y firma. El flujo
Android vuelve a comprobar la compilación minificada y el arranque/actualización
en emulador; no sube nada a Google Play. Su prueba de contenido carga el dominio
configurado y **no valida las nuevas pantallas de esta rama** hasta que se use
una URL de prueba o se publique una versión web comprobada. Las pruebas de
Playwright con Pixel 5 son emulación de interfaz en Chromium, no pruebas de
Android real ni de permisos de micrófono/cámara o voz TTS del teléfono.

Antes de distribuir: probar esta vista previa en Chrome Android, confirmar
lectura ×1/×2/×3 y calidad de voz, dictado y reapertura de datos; comprobar el AAB
instalado desde la prueba cerrada con las cuentas autorizadas. No sustituir esa
evidencia por el resultado de la compilación.
