# DIETEAR: bienestar y aprovechamiento

Fecha: 19 de octubre de 2026. Cambios aditivos sobre `main`; sin alterar el catálogo de imágenes ni la firma Android.

## Implementado

- **Objetivos diarios**: elegir hasta tres conductas, marcar o desmarcar, revisar siete días y borrar exclusivamente este historial. Los días sin datos no se evalúan como incumplimiento. Se conserva la clave `dietear-daily-habits`, migrando las marcas antiguas sin inventar objetivos retrospectivos. Se usa el calendario local, no el día UTC.
- **Descanso**: inicio y fin con fecha y hora, percepción de descanso y energía, edición del descanso principal por fecha de despertar, eliminación y persistencia en el historial general. Soporta descanso diurno y cambios de horario estacional. La duración representa el intervalo anotado, no sueño medido. La variación horaria es un rango descriptivo circular, nunca una puntuación clínica. Los registros antiguos sin horarios se conservan.
- **Movimiento breve**: opciones suaves de 1, 3, 5 y 10 minutos, movilidad sentada o caminar/movilidad cómoda. Solo registra actividad tras confirmación y evita doble pulsación. No se presentan como equivalentes a protocolos intensos de investigación, ni como rehabilitación, ni como calorías que puedan compensarse comiendo.
- **Nevera**: caducidad y consumo preferente por separado; fecha, cantidad, unidad, apertura, congelación y coste opcionales. Se conservan las fechas antiguas como tipo no confirmado. La apertura/congelación no amplía automáticamente ninguna vida útil. Los lotes con fecha vencida no cuentan como disponibles, aunque el consumo preferente superado no se califica automáticamente de inseguro. Se aplican las restricciones existentes a las ideas de recetas; etiquetas, trazas y conservación siguen requiriendo revisión humana.
- **Compra**: descuento reversible de cantidades solo con nombre exacto y la misma unidad. No adivina conversiones, cantidades, alimentos equivalentes ni descuentos de platos de texto libre. La cantidad descontada se conserva para impedir reutilizar el mismo stock; un artículo cubierto no se marca como comprado. Los precios de cantidades modificadas deben introducirse de nuevo.
- **Aprovechamiento**: registro explícito de lotes completos usados o desperdiciados, retirada de inventario y resumen mensual de kg/coste declarados. Los valores no se denominan ahorro verificado ni desperdicio evitado demostrado. No se convierten litros/unidades a kg. Eliminación por registro sin reposición implícita.
- **Resumen conectado**: actividad y descanso del día, objetivos conductuales reales, compra pendiente y plan de la semana actual (no una semana futura que se estuviera editando).
- **Persistencia y minimización**: se avisa si el almacenamiento falla. Un estado ilegible o de versión desconocida no se sobrescribe automáticamente. El aprovechamiento se guarda fuera del perfil que se utiliza en consultas; el descanso se filtra del contexto de IA y análisis alimentario. Política de privacidad actualizada para estos datos locales.

Flujo: control de pantalla → validación local → estado React/almacenamiento local → recarga → resumen. Estos módulos no llaman a API, IA ni servicios externos. Continúan siendo datos de bienestar locales; no existe sincronización entre dispositivos, control clínico ni compatibilidad universal de hardware.

## Validación

`npm test`: pruebas unitarias de fecha local, cambio estacional, migración y revisión de hábitos, sueño diurno/nocturno, duplicados, lotes vencidos, ingredientes, restricciones, descuentos de stock, datos ausentes, totales mensuales y errores de almacenamiento.

`npm run build`: compilación de producción Next.js.

Resultado local: **23/23 pruebas de datos correctas**, compilación correcta y **8 escenarios completos de navegador correctos**. Se comprobó el panel de descanso a 320, 390, 768 y 1440 px. Los escenarios cubren guardado/recarga, ausencia de duplicados, conservación de registros anteriores, lotes bloqueados, descuentos de compra, aprovechamiento y aviso de almacenamiento lleno. No se observaron errores de ejecución ni envíos a API durante las acciones de esos módulos. Un escenario adicional simula una respuesta a una consulta explícita de IA (interceptada, sin llamar a ningún proveedor) y comprueba que el cuerpo no incluya los nuevos datos de descanso/aprovechamiento. No equivale a pruebas con un reloj, un teléfono físico o lectores de pantalla.

`tests/wellness-browser.mjs`: prueba con datos sintéticos del flujo completo en navegador. Requiere Playwright y Chromium instalados; utiliza `DIETEAR_CHROMIUM_EXECUTABLE` opcionalmente. Ejecutar después de compilar. Arranca su propio servidor y no necesita secretos. `DIETEAR_SCREENSHOT_DIR` habilita una captura temporal del panel de descanso.

Se añade un flujo de GitHub Actions para pruebas de datos y compilación web. No modifica la firma, los secretos, los permisos ni el AAB enviado a Google Play.

## Pendientes explícitos

1. **Health Connect**: Android es una TWA de Browser Helper, sin actividad/puente nativo de lectura de datos. Hace falta implementar el SDK con permisos mínimos y revocables, procedencia y deduplicación, pruebas en dispositivos reales y la declaración correspondiente en Google Play. No se marca conectado ni se solicitan permisos ficticios. No se exige Google Fit como paso previo.
2. **Apple Health y fabricantes**: integraciones independientes, todavía no disponibles. No equivale a conectar Bluetooth genérico.
3. **Valoración nutricional automática**: no se inventa una puntuación clínica a partir de menús escritos o marcas de hábitos. Haría falta un registro de consumo estructurado, composición nutricional verificable, porciones y revisión profesional antes de evaluar una semana. Planificar no equivale a consumir.
4. **Privacidad clínica**: la persistencia local no garantiza cifrado ni control de acceso. Las mejoras no convierten el módulo en historia clínica ni autorización para tratar datos de menores o modificar medicación.
   Los demás campos de contexto de las consultas de IA conservan su comportamiento anterior; esta propuesta no equivale a una auditoría completa de consentimiento y tratamiento del resto de la aplicación.
5. Pruebas físicas Android, accesibilidad con tecnologías asistivas y validación profesional de contenidos antes de afirmaciones clínicas o de compatibilidad.

## Fuentes primarias contrastadas

- EFSA, etiquetado de fechas (revisión del 3 de abril de 2025): https://www.efsa.europa.eu/en/safe2eat/food-date-labelling
- OMS, actividad física: https://www.who.int/news-room/fact-sheets/detail/physical-activity
- Android Developers, Health Connect y arquitectura/permisos: https://developer.android.com/health-and-fitness/health-connect
- Android Developers, tipos de datos y declaración en Play Console: https://developer.android.com/health-and-fitness/health-connect/data-types

Las ideas de personalización se aplican como seguimiento de conductas de bienestar, sin prometer pérdida de peso, prevención de enfermedades ni beneficios del ejercicio intenso para las rutinas suaves aquí descritas.

## Actualización de alcance

La decisión posterior de publicar una versión centrada en bienestar amplía la separación de datos: los registros clínicos antiguos y las notas profesionales tampoco entran en el contexto automático. Véase `version-bienestar-play-2026-10-19.md`. La propuesta deja de mantener activos los controles clínicos anteriores.
