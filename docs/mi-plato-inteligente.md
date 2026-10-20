# Mi plato inteligente — especificación de desarrollo

Estado: preparación independiente; NO publicado ni integrado en main.

## Flujo principal
1. Fotografiar plato o seleccionar imagen, con consentimiento explícito.
2. Identificar ingredientes probables; solicitar tamaño de ración, salsas y aceite. Nunca presentar estimaciones como mediciones exactas.
3. Mostrar estimaciones de energía (kcal), proteínas, carbohidratos, grasas y, cuando haya datos fiables, fibra; permitir corregir ingredientes y cantidades.
4. Guardar la comida confirmada en el diario del usuario y permitir editarla o borrarla.
5. Proponer «¿Qué como hoy?», «¿Qué ceno hoy?» y «¿Qué como mañana?» teniendo en cuenta ingestas registradas, objetivos, preferencias, alergias y alimentos disponibles, sin compensaciones extremas.
6. Reutilizar recetas y planificación existentes para evitar duplicaciones.

## Diseño
Botón «Mi plato inteligente»: fotografía real de plato colorido con cámara claramente reconocible, borde verde neón y texto legible. Acciones: «Fotografiar mi comida», «Calcular nutrientes», «¿Qué ceno hoy?», «¿Qué como mañana?». Imágenes únicas, optimizadas para móvil y accesibles.

## Privacidad, seguridad y calidad
No enviar fotografías a servicios externos sin información clara y consentimiento. Minimizar almacenamiento y permitir eliminación. No inferir diagnósticos. Alertar de incertidumbre de porciones; respetar alergias y restricciones. Limitar coste de inferencia, proteger claves en servidor, validar tamaño y tipo de archivo, manejar errores y falta de conexión.

## Criterios de aceptación antes de integrar
- Cámara y selector de imagen funcionan en Android y web compatible.
- Corrección manual y guardado persisten tras recarga.
- Cálculos se contrastan con fuente nutricional adecuada y se indican como estimados.
- Recomendaciones usan datos del día y respetan alergias; no recomiendan restricciones peligrosas.
- Interfaz responsive, accesible y con estados de carga/error.
- Pruebas de privacidad, costes y regresión completas.

## Próximas tareas
Inspeccionar rutas actuales de Alimentación, recetas, diario, autenticación y API; implementar incrementalmente en esta rama; ejecutar pruebas; abrir PR sin fusionarlo hasta aprobar publicación.
