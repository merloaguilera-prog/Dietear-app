# Borrador de Seguridad de los datos · Google Play

Este documento debe contrastarse con la versión exacta que se suba a Play Console. No marcar respuestas por intuición.

## Datos locales

La versión de bienestar guarda principalmente en el dispositivo datos introducidos por la persona usuaria: perfil, objetivos, alimentación, hábitos, actividad, peso, medidas, alergias e intolerancias y notas alimentarias del profesional. No ofrece controles clínicos, registro de medicación ni interpretación de analíticas. No hay sincronización automática entre dispositivos declarada como activa.

Los registros clínicos de versiones anteriores permanecen en sus ubicaciones locales originales; no se borran ni se muestran como función activa. Se excluyen del contexto automático de IA tanto en el navegador como en el servidor. Las notas profesionales y los nombres familiares también quedan fuera de ese contexto. El texto escrito expresamente por la persona puede contener datos sensibles; las advertencias y el límite a consultas clínicas no equivalen a un detector infalible.

## Datos que pueden salir del dispositivo

| Función | Datos | Finalidad | Activación |
|---|---|---|---|
| DIETEAR IA | Consulta, selección del perfil alimentario, peso/actividad, nevera y plan semanal | Responder a la consulta de bienestar | Solo cuando la persona pulsa enviar |
| Análisis de alimento | Texto, selección del perfil alimentario y peso/actividad | Generar análisis nutricional orientativo | Solo cuando se solicita |
| Escáner de producto | Código de barras | Consultar la ficha pública del producto | Solo cuando se escanea |
| Alojamiento web | Datos técnicos y registros de seguridad | Funcionamiento y protección del servicio | Necesario para usar la app conectada |

## Declaraciones que deben mantenerse

- No vender datos personales.
- No utilizar datos de salud para publicidad personalizada.
- Solicitar la cámara únicamente al activar el escáner; la imagen se procesa en el dispositivo y se consulta el código detectado.
- Explicar que la eliminación de datos locales puede hacerse desde la aplicación o los ajustes del dispositivo.
- Mantener visible el aviso de que DIETEAR no sustituye atención médica.

## Comprobaciones antes de enviar

- Confirmar los proveedores reales y sus periodos de conservación.
- Vercel Analytics, publicidad, autenticación y sincronización no están integrados en esta versión; volver a comprobarlo antes de cada envío.
- Confirmar cifrado en tránsito para todas las conexiones.
- Confirmar un correo público de soporte y privacidad.
- Revisar cada respuesta del formulario de Play Console contra el comportamiento de producción.
