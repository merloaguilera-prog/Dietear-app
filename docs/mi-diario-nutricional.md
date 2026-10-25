# Mi Diario Nutricional — DIETEAR

Estado: especificación de implementación; no activar en producción hasta completar pruebas.

## Alcance
- Registrar desayuno, media mañana, almuerzo, merienda, cena y recena opcional, también en Día Comodín.
- Añadir uno o varios platos por comida mediante texto, dictado o fotografía (cámara y galería).
- Analizar fotografías como sugerencia: pedir confirmación de ingredientes, raciones, gramos, aceites y salsas; nunca presentar calorías como exactas.
- Guardar foto, fecha/hora, usuario, comida, ingredientes, cantidad, energía (kcal), proteínas, hidratos, grasas y fibra; distinguir datos estimados de confirmados.
- Permitir editar, eliminar y repetir platos sin duplicados accidentales.
- Agregar totales por comida y día; medias y totales por semana, mes y año; calendario e historial fotográfico.
- Conectar los datos de Día Comodín con Mi Progreso y mantener perfiles de Mi Familia separados.
- Guardar los registros en el backend de la cuenta autenticada con controles de acceso; no exponer fotos privadas públicamente.
- Gestionar permisos de cámara y micrófono; mostrar alternativas manuales y errores claros.
- Accesibilidad: campos grandes, flujo de siguiente campo y confirmación explícita del dictado.

## Criterios de aceptación
1. Un registro creado por foto, voz o texto aparece tras cerrar y reabrir sesión.
2. Corregir un plato recalcula totales sin contar dos veces.
3. El Día Comodín cuenta en el historial y en los agregados.
4. Las vistas diaria, semanal y mensual cuadran con la suma de sus platos.
5. Las fotos y registros de un familiar no se muestran en otro perfil sin autorización.
6. No hay botones inertes; permisos denegados no bloquean la aplicación.
7. La app Android arranca correctamente antes de publicar un nuevo AAB.
