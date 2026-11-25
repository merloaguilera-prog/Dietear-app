# Borrador de Seguridad de los datos · Google Play

Este documento debe contrastarse con la versión exacta que se suba a Play Console. No marcar respuestas por intuición.

## Datos locales

La versión actual guarda principalmente en el dispositivo datos introducidos por la persona usuaria: perfil, objetivos, alimentación, hábitos, actividad, peso, medidas e información de salud opcional. No hay sincronización automática entre dispositivos declarada como activa.

## Datos que pueden salir del dispositivo

| Función | Datos | Finalidad | Activación |
|---|---|---|---|
| DIETEAR IA | Consulta y contexto autorizado | Responder a la consulta | Solo cuando la persona pulsa enviar |
| Análisis de alimento | Texto y contexto autorizado | Generar análisis orientativo | Solo cuando se solicita |
| Foto de plato | Imagen seleccionada, sin perfil sanitario | Crear un borrador estimado editable | Consentimiento y botón Analizar foto; confirmar antes de registrar |
| Dictado y lectura | Audio o texto según el servicio del navegador/dispositivo | Introducir datos y leer contenido | Acción explícita de la persona |
| Escáner de producto | Código de barras | Consultar la ficha pública del producto | Solo cuando se escanea |
| Alojamiento web | Datos técnicos y registros de seguridad | Funcionamiento y protección del servicio | Necesario para usar la app conectada |

## Declaraciones que deben mantenerse

- No vender datos personales.
- No utilizar datos de salud para publicidad personalizada.
- Distinguir el escáner (imagen procesada localmente; se consulta el código) del análisis de platos (imagen enviada a IA tras consentimiento). No se guarda la imagen del plato en el diario.
- Incluir las fotos y el servicio de voz del navegador en la revisión de declaraciones antes de distribuir esta rama.
- Explicar que la eliminación de datos locales puede hacerse desde la aplicación o los ajustes del dispositivo.
- Mantener visible el aviso de que DIETEAR no sustituye atención médica.

## Comprobaciones antes de enviar

- Confirmar los proveedores reales y sus periodos de conservación.
- Vercel Analytics, publicidad, autenticación y sincronización no están integrados en esta versión; volver a comprobarlo antes de cada envío.
- Confirmar cifrado en tránsito para todas las conexiones.
- Contacto público comprobado en Configuración de la tienda (25/11/2026): merloaguilera@gmail.com; añadido a la política de privacidad en esta preparación.
- Revisar cada respuesta del formulario de Play Console contra el comportamiento de producción.
