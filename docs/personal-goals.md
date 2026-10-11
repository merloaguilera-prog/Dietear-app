# Mis objetivos — selección múltiple y avance útil

Se sustituye el selector único por botones accesibles que permiten elegir una o varias metas, tanto en Mi ficha como en Mis objetivos. El objetivo antiguo se conserva como primera selección cuando no existe una lista nueva; se puede desmarcar todo. `profile.goals` guarda la lista y `profile.goal` mantiene un resumen compatible con las integraciones actuales. Las metas y sus referencias se persisten con el estado existente.

El panel aparece en Inicio y Mis objetivos y reemplaza la planta decorativa de ese apartado. Las tarjetas diferenciadas por color muestran datos y una acción concreta:

- Salud: número de registros de salud esta semana y acceso a Salud y necesidades. Sin porcentaje de salud.
- Peso: última medición, meta personal opcional y distancia a ella. El anillo usa la referencia al fijar la meta y funciona para bajar o subir de peso. Si no hay medición o referencia, no se inventa un porcentaje.
- Alimentación: días organizados del plan abierto sobre siete. Se indica que planificar no equivale a haber comido esos platos.
- Movimiento: minutos registrados de lunes a hoy y referencia semanal opcional elegida por la persona.
- Fuerza: actividades guardadas como Fuerza durante esta semana y número de sesiones elegido por la persona.
- Hábitos: días distintos de esta semana con agua, pasos, actividad, fruta o descanso registrados. No es una puntuación de salud.

Editar las referencias o desmarcar una meta no borra el historial. La IA recibe el conjunto de metas solo cuando está habilitado el consentimiento de contexto de la consulta; su credencial sigue pendiente.

Validación: `TZ=Europe/Madrid node --test tests/personal-goals.test.mjs tests/progress-bluetooth.test.mjs` (10 pruebas). Se comprueban migración desde selección única, selección múltiple y recarga, periodo semanal, dirección de la meta de peso, datos ausentes y separación de planificación/consumo. Compilación Next.js correcta. La inspección visual en móvil sigue pendiente.

Referencias funcionales: objetivos editables y anillos de progreso de Google Health/Fitbit y resumen semanal de registros de MyFitnessPal, con una implementación propia para DIETEAR.

- https://support.google.com/googlehealth/answer/14236914?hl=en
- https://support.myfitnesspal.com/hc/en-us/articles/45246617814669-Introducing-Progress-Overview-Your-Progress-Personlized
