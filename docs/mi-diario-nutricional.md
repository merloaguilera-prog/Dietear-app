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

## Flujo prioritario: fotografía y cálculo del total diario
1. En cualquier comida del día, tocar «Hacer foto» o «Elegir foto» y asociar la imagen a esa fecha y franja de comida.
2. Detectar posibles alimentos y sugerir porciones e ingredientes, indicando claramente que son estimaciones visuales.
3. Solicitar confirmación o corrección de tamaño de ración, ingredientes, aceite, bebidas y acompañamientos antes de calcular.
4. Consultar datos nutricionales de una fuente fiable por alimento y cantidad; mostrar kcal estimadas por plato y subtotal de la comida.
5. Sumar automáticamente todos los platos y bebidas registrados durante el día, incluso los del Día Comodín, sin duplicar registros.
6. Mostrar calorías consumidas del día, desglose por desayuno/media mañana/almuerzo/merienda/cena/recena, fotos y estado «estimado» o «confirmado».
7. Recalcular de inmediato al editar, añadir o borrar; incluir los mismos registros en estadísticas semanales y mensuales.
8. Si la foto es ambigua o no se reconoce un plato, ofrecer selección manual o dictado; no inventar una cifra precisa.
9. Permitir varias fotografías por comida y platos compartidos, registrando solo la cantidad realmente consumida por cada persona.

### Pruebas específicas
- Fotografiar dos platos y una bebida para un mismo almuerzo: el subtotal y total diario incluyen los tres una sola vez.
- Añadir una merienda mediante foto y corregir la ración: cambian el subtotal, el total diario y el agregado semanal.
- Una fotografía sin cantidad confirmada muestra una estimación y su advertencia.
- Al cambiar de fecha, cada fotografía y su energía siguen vinculadas al día correcto.
