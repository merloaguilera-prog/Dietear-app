# Borrador de Seguridad de los datos · Google Play

Este documento debe contrastarse con la versión exacta que se suba a Play Console. No marcar respuestas por intuición.

## Datos locales

La versión actual guarda principalmente en el dispositivo datos introducidos por la persona usuaria: perfil, objetivos, alimentación, hábitos, actividad, peso, medidas e información de salud opcional. No hay sincronización automática entre dispositivos declarada como activa.

## Datos que pueden salir del dispositivo

| Función | Datos | Finalidad | Activación |
|---|---|---|---|
| DIETEAR IA | Consulta y contexto autorizado | Responder a la consulta | Solo cuando la persona pulsa enviar |
| Análisis de alimento | Texto o imagen aportada | Generar análisis orientativo | Solo cuando se solicita |
| Escáner de producto | Código de barras | Consultar la ficha pública del producto | Solo cuando se escanea |
| Alojamiento web | Datos técnicos y registros de seguridad | Funcionamiento y protección del servicio | Necesario para usar la app conectada |

## Declaraciones que deben mantenerse

- No vender datos personales.
- No utilizar datos de salud para publicidad personalizada.
- Solicitar cámara o micrófono únicamente al activar una función compatible.
- Explicar que la eliminación de datos locales puede hacerse desde la aplicación o los ajustes del dispositivo.
- Mantener visible el aviso de que DIETEAR no sustituye atención médica.

## Comprobaciones antes de enviar

- Confirmar los proveedores reales y sus periodos de conservación.
- Confirmar si Vercel Analytics, publicidad, autenticación o sincronización están activados.
- Confirmar cifrado en tránsito para todas las conexiones.
- Confirmar un correo público de soporte y privacidad.
- Revisar cada respuesta del formulario de Play Console contra el comportamiento de producción.
