# Mis objetivos · selección múltiple

La página permite elegir los nueve objetivos disponibles, marcar todos o desmarcar cada uno. Incluye una prioridad, sugerencias de pasos con acceso a las herramientas existentes, marcas diarias explícitas y un resumen de siete días.

## Compatibilidad y persistencia

- `profile.personalGoals` contiene IDs estables. Si no existe, se recupera el objetivo antiguo desde `profile.goal`; una lista vacía expresa que no se ha elegido ninguno.
- `profile.goal` conserva la prioridad para los consumidores anteriores. Cambiarla añade el objetivo a la selección y conserva los demás; quitar la prioridad elige el primer objetivo restante.
- `profile.goalCheckins` conserva listas de pasos confirmados por fecha local. Las marcas son reversibles y no escriben mediciones, comidas, actividad ni logros automáticos en el historial.
- Desmarcar un objetivo mantiene las marcas históricas. El resumen semanal usa días de calendario y excluye fechas posteriores al día consultado.
- La recuperación valida IDs, fechas, duplicados y tipos. Los objetivos diarios de agua/pasos/actividad/fruta conservan su estructura y su historial.
- Mi día conectado cuenta los objetivos personales elegidos; Mi ficha permite cambiar la prioridad y volver a la selección múltiple.

## Comprobación

Pruebas unitarias de selección, compatibilidad anterior, prioridad, marcas reversibles, cambio de fecha y recuperación; recorridos E2E en escritorio y tamaño móvil para selección de todos, reapertura, desmarcado total, acceso a recetas/actividad y consistencia con Mi ficha. Evidencia concreta en el PR #51. No hay recordatorios externos ni cambios en datos de salud.
