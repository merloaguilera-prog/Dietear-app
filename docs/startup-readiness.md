# Arranque y acceso a la prueba cerrada — 25/10/2026

## Corrección de conexiones bloqueadas

Una navegación gestionada por el service worker podía esperar indefinidamente
si `fetch` no recibía respuesta ni rechazaba la conexión. Se limita a 10 segundos
la espera de las cabeceras del documento. Al agotarse, se cancela esa petición y
se usa la página guardada de esa URL, o la pantalla de recuperación sin conexión.
Si la caché está bloqueada, se devuelve HTML con una acción para reintentar.
La corrección no elimina almacenamiento local, planes ni perfiles.

El límite se aplica a navegaciones que ya controla el service worker. No garantiza
que la primera visita, las imágenes o todos los recursos terminen de cargar en
10 segundos. Tampoco cambia la instalación ni los permisos de Google Play.

## Evidencia de probadores pendiente

Las capturas aportadas el 25/10 muestran dos situaciones: algunas cuentas ven
«Aplicación no disponible» y otra cuenta obtiene la confirmación de una solicitud
de instalación remota («se instalará pronto»). Esa confirmación no acredita que
la instalación terminara ni que la versión distribuida abra y vuelva a abrir.

La apertura tardía comunicada no permite distinguir instalación pendiente de
carga lenta sin más datos. No se ha reproducido ese caso concreto.

Antes de volver a invitar al grupo, verificar en Play Console que la lista de
18 correos está seleccionada y guardada en Alpha, que el lanzamiento está
disponible para sus cuentas y países y que usan la misma cuenta al aceptar y
descargar. Registrar versión/código, origen Google Play, fecha y dos aperturas
correctas de al menos un probador autorizado. No sustituir esa evidencia por
pruebas web o instalación por ADB.

El acceso automatizado a Play Console sigue bloqueado por el control de dominio;
esta corrección no intenta acceder ni eludir ese bloqueo.
