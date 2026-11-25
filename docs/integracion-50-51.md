# Integración DIETEAR · seguimiento de #50 y #51

Revisión de publicación: 25/11/2026. El PR #51 fue fusionado en `main` como `fdd1d6cc41a28b66899cbebde9f7fb3325b0a288` y Vercel desplegó la web en producción. Android/Play se comprueban por separado. Ningún cobro activado. Estado y evidencias: [preparación de publicación](publicacion-2026-11-25.md).

## Inventario de pantallas

| Pantalla / función | Estado y límite comprobable | Código / evidencia |
| --- | --- | --- |
| Arranque web y cinco pestañas | Persistencia con recuperación de datos dañados; pruebas unitarias y recorrido E2E | `app/page.js`, `lib/dietear-store.js`, `tests/state-recovery.test.mjs`, `tests/e2e/dietear.spec.mjs` |
| Arranque Android | TWA 1.0.3 (código 4) preparada; conserva los componentes de arranque y prueba de actualización minificada. Pendiente la instalación real desde Play de esta versión | `android/native`, flujo `Android build` |
| Hoy / objetivos diarios | Registro manual de agua, pasos, actividad y fruta; historial local | `app/page.js`, `components/ConnectedDay.js` |
| DIETEAR IA | Consulta conectada al proveedor configurado; lectura añadida; requiere comprobación del proveedor real | `components/DietearAI.js`, `app/api/ai/route.js` |
| Crear mi dieta | Guarda estilo y preferencias; abre el libro filtrado. No genera una prescripción nutricional | `app/page.js`, `lib/recipe-selection.mjs` |
| Qué como hoy | Libro actual de 64 recetas, búsqueda y filtros; selección conectada al plan | `components/RecipeIdeas.js` |
| Todo Dietas | Ocho libros iniciales de 16 recetas; máximo cinco compartidas por pareja. Filtros por ingredientes declarados. Los estilos sin libro revisado muestran pendiente e ideas generales separadas | `lib/recipe-selection.mjs`, `tests/recipe-selection.test.mjs` |
| Recetas rápidas | Fotos ilustrativas distintas por receta, ingredientes, raciones, preparación, resumen y lectura. No hay nutrición verificada por ingrediente en este catálogo | `components/RecipeIdeas.js`, `components/RecipePhoto.js` |
| Favoritas / No me gusta / Cambiar | Favoritas heredadas se conservan; cambios nuevos en el perfil central. Exclusión de no me gusta en nuevas semanas y libros; bandeja para recuperar | `components/RecipeIdeas.js`, pruebas E2E |
| Mi Nevera | Alta y eliminación manual; sugerencias con los alimentos disponibles | `components/FridgeIdeas.js`, `app/page.js` |
| Mi Compra / Generar compra | Ingredientes y raciones por comida; consolidación por producto/unidad. Seleccionar una receta no cambia las raciones de las demás comidas | `lib/recipes.js`, `lib/week-plan.js`, `tests/plan-servings.test.mjs` |
| Comer bien con presupuesto | Acciones enlazadas a nevera, plan y compra; sin precios reales ni optimización económica | `app/page.js` |
| Analizar alimento / Diario | Texto o dictado y foto opcional. Propuesta de foto revisable; confirmación antes de registrar; persistencia en el historial compartido | `components/MealDiary.js`, `lib/meal-diary.mjs`, pruebas unitarias y E2E |
| Foto de plato | Envío opcional tras consentimiento; se quita EXIF y se limita imagen. Nutrientes como estimación; no se guarda la imagen. API probada con respuestas controladas; pendiente proveedor real | `app/api/meal-photo/route.js`, `lib/meal-photo-handler.mjs` |
| Es bueno para mí / análisis de composición | Ficha con fuentes y valores desconocidos; consulta externa requiere proveedor configurado | `components/FoodAnalysis.js`, `lib/food-analysis.js` |
| Mi plan / Modificar plan / Menú semanal | Calendario editable, semanas archivadas y compra enlazada; raciones por comida conservadas tras reabrir | `components/DesignedScreens.js`, `lib/week-plan.js` |
| Crear semana | Se eligen recetas del catálogo que pasan el filtro de ingredientes/exclusiones; no se aplica un menú genérico a dietas específicas sin validar | `lib/recipe-selection.mjs`, `app/page.js` |
| Personas / Mi familia | Cantidades y restricciones familiares parciales. Pendiente el aislamiento completo de datos por persona y cuenta | `components/FamilyPlanner.js`, `components/FamilyNutrition.js` |
| Día comodín / Fiestas | Herramientas manuales; pendiente diario completo por comidas y persistencia de todas las opciones especiales | `app/page.js` |
| Copiar / Viajes / Trabajo | Navegación y edición manual; no hay optimización automática de agendas o viajes | `app/page.js` |
| Peso y medidas | Registro manual y gráficas; sin sincronización de básculas | `components/HealthMetrics.js`, `components/EvolutionCharts.js` |
| Pasos y actividad | Ocho categorías con fotos autorizadas; tres guías iniciales por niveles y lectura; registro manual explícito | `components/ExerciseGallery.js`, `lib/exercise-foundation.mjs` |
| Mis gráficas / Mi Camino | Historial compartido; energía registrada por día solo si todas sus entradas tienen dato; no se resta ejercicio de ingesta | `components/EvolutionCharts.js`, `components/ProgressDashboard.js` |
| Fotos de evolución | Pendiente almacenamiento privado; la pantalla informa de que no se suben fotografías | `app/page.js` |
| Mis logros / Cómo puedo mejorar | Lectura de registros y objetivos; sugerencias básicas | `app/page.js` |
| Hidratación / Sueño y descanso | Registro manual en historial; sin medición automática | `app/page.js` |
| Mi ficha / objetivos / motivaciones | Nueve objetivos combinables, prioridad, pasos manuales y resumen de siete días. Perfil persistente. Dictado editable con confirmación, siguiente campo y deshacer; se comprueba reapertura | `components/DataEntryAssistant.js`, pruebas E2E |
| Salud y necesidades | Registros e información educativa existentes; no diagnóstico ni ajuste de medicación. Revisión adicional de privacidad pendiente | `components/HealthAreas.js`, `components/HealthJournal.js` |
| Gustos y alimentos | Preferencias, alergias e intolerancias; cribado básico por nombres e ingredientes, sin garantía sobre trazas/certificaciones | `app/page.js`, `lib/recipe-selection.mjs` |
| Privacidad y permisos | Información actualizada para foto, voz y lectura; exportación/borrado y aislamiento global deben completarse en fases posteriores | `app/privacidad/page.js`, `android/data-safety-es.md` |
| Apps y dispositivos | Pendiente conexión real, consentimiento revocable y deduplicación entre proveedores | `app/page.js` |
| Club / Premium / Acceso profesional | Parcial o pendiente. Sin compras ni suscripciones activas; Google Play Billing no integrado | `components/DietearClub.js`, `app/page.js` |

## Modelo y límites de esta entrega

- Se conserva `dietear-state-v2`: no se borran perfiles, registros previos ni claves
  heredadas. Los nuevos registros de comida usan `history`, tipo `comida`, y un
  objeto `food` versionado. La lectura agrega únicamente entradas confirmadas,
  válidas y con ID único; no convierte nutrientes desconocidos en cero.
- `profile.readingRate` recuerda ×1/×2/×3 para recetas, guías, dietas y respuestas.
  No hay reproducción automática. Navegar o dejar la app en segundo plano detiene
  la lectura. La velocidad efectiva y la calidad se deben oír en el motor real;
  algunos motores limitan la velocidad sin comunicarlo por API.
- Pausa/continuar repite el fragmento corto interrumpido; evita depender de la
  pausa nativa que algunos motores Android no conservan.
- La foto no se envía al seleccionarla. Se recodifica sin EXIF, con lado máximo
  1600 px. API: máximo 5 MB, tiempo máximo de consulta 35 s y presupuesto de tres
  solicitudes/minuto por IP/instancia. Este límite en memoria no es un control
  distribuido de cuotas ni sustituye autenticación o protección de infraestructura.
- No se afirma aptitud clínica, ausencia de alérgenos ocultos, certificación halal
  ni micronutrientes verificables en las recetas sin fuentes de composición.
- Pendientes: más contenido editorial por dieta, nutrición contrastada por
  ingrediente, imágenes de cada ejercicio, rutinas completas, familia aislada,
  wearables, cuentas/sincronización y PRO/Billing con compras de prueba.

## Validación

`npm test`, `npm run build` y `npm run test:e2e`. Las pruebas de navegador cubren
escritorio y tamaño Pixel 5; simulan voz y análisis de imagen para verificar los
flujos sin enviar fotos ni efectuar consultas pagadas. **No acreditan precisión
nutricional ni funcionamiento de hardware, servicio de reconocimiento o motor
TTS en un teléfono.** El flujo Android no publica en Play.

Los resultados y ejecuciones concretas se registran en el PR #51. Antes de
producción: revisión de la vista previa, pruebas Android reales (dos aperturas,
dictado, audio y foto), privacidad y declaraciones de Play para el binario exacto.
