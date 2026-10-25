# DIETEAR — mejoras acordadas y plan de integración
Actualizado: 25 de octubre de 2026.

## Reglas que no se deben romper
- Conservar datos, perfiles, funciones y navegación existentes. Trabajar en rama, probar y fusionar solo con validación.
- No publicar producción ni modificar el lanzamiento Alpha sin verificar el arranque.
- Mantener la identidad verde naturaleza, imágenes reales HD luminosas y marcos verdes neón. No repetir fotografías entre tarjetas ni usar imágenes demasiado parecidas.
- No mezclar módulos. Interfaz sencilla, accesible para jóvenes y mayores.
- Publicidad discreta: sin ventanas emergentes, reproducción automática ni anuncios durante recetas, ejercicio, salud o datos sensibles. DIETEAR independiente de YUMA.

## Prioridad 0 — estabilidad Android y prueba cerrada
- Investigar y corregir el crash TWA en `com.google.androidbrowserhelper.trusted.ManageDataLauncherActivity.addSiteSettingsShortcut`.
- Validar AAB firmado, instalación, apertura en diferentes Android, enlaces de testers y errores en Play Console.
- 18 correos invitados no equivalen a 18 instalaciones; comprobar estadísticas reales, aceptación de pruebas y errores por versión.
- No ampliar difusión hasta que la app abra de forma fiable.

## Prioridad 1 — Crear mi dieta, menús y recetas
Flujo: Alimentación → Crear mi dieta → elegir estilo → lista de muchos menús compatibles → comidas del menú → receta → preparación paso a paso.
- Cada dieta con fotografía propia, distinta, clara, colorida; conservar las cuatro referencias aprobadas (equilibrada, mediterránea — pescado especialmente —, diabética y mantenimiento).
- Diferenciar Mediterránea, Equilibrada, Por Puntos, Keto, vegetariana, vegana, sin gluten, sin lactosa, hiposódica, halal, diabética, mantenimiento, etc.
- NO mostrar recetas genéricas como válidas para restricciones o patologías sin comprobar ingredientes. No inventar puntuaciones de la dieta por puntos.
- Muchos menús: familiar, económico, rápido, por temporada, semanal; platos variados y sin repeticiones excesivas.
- Ficha por receta: foto exclusiva, ingredientes, cantidades/raciones, tiempos, pasos claros, temporizadores, sustituciones seguras, opción de voz y vídeo cuando exista con derechos.
- Guardar favoritos, cambiar platos, enviar al plan y generar compra. Ajustar cantidades a personas y nevera.

## Prioridad 2 — experiencia y datos
- Micrófono en TODOS los campos apropiados de introducción de datos; el dictado debe quedar persistido y permitir pasar al siguiente campo. Mantener escritura manual.
- Inicio guiado por pasos cortos; no obligar a introducir todo de una vez. Después, panel Hoy/Mi día.
- Menú inferior acordado: Hoy, Alimentación, Mi plan, Progreso, Para mí; conservar accesos existentes. Cada función en su módulo.
- Sincronización por cuenta entre móvil, web y tablet; conexiones opcionales con Health Connect, Apple Health y dispositivos compatibles; evitar duplicados, separar familiares y pedir permisos.
- Mi Plato Inteligente, registro por voz/foto/texto/código de barras, Diario Nutricional, Día Comodín, nevera/caducidades, compra, presupuesto y análisis de productos.
- Dieta por Puntos con presupuesto diario/semanal definido y verificable, comidas, recetas y seguimiento.

## Prioridad 3 — ejercicio, familia y bienestar
- Ejercicios ordenados y numerados, cada uno con imagen real única, tres pasos y alternativa sencilla.
- Imágenes de órganos y zonas corporales sin repetir, bien proporcionadas, y resaltado de la zona activa.
- Mi Familia: perfiles aislados, edad, gustos, alergias y circunstancias; consejos adecuados y sin afirmaciones clínicas injustificadas.
- Seguimiento de peso, medidas, pasos, agua, sueño y hábitos; gráficas por intervalos y objetivos.
- Registros de salud sensibles, si se mantienen, con privacidad, avisos y revisión de las declaraciones de Google Play; no reintroducir funciones retiradas por cumplimiento sin nueva decisión.
- Keto; SOS/Primeros Auxilios gratuito y sin anuncios.

## Prioridad 4 — negocio y publicación
- Gratis útil con anuncios discretos; propuesta aceptada de Premium 2,99 €/mes o 29,99 €/año, sin anuncios. No activar cobros sin circuito validado.
- Acceso desde diferentes dispositivos con la misma cuenta, datos persistentes y privacidad.
- Web y Android; Play Store solo tras pruebas de funcionamiento y revisión de requisitos.

## Estado comprobable
- `components/DietMenuExplorer.js` implementa un explorador inicial de cuatro ejemplos de menú, ingredientes y pasos; se conecta a `app/page.js` en esta rama.
- Por seguridad, estos ejemplos solo se ofrecen para estilos generales Equilibrada y Mediterránea; NO equivalen a una colección completa personalizada.
- Las fotografías aprobadas son referencias; no están integradas como archivos de imagen en la aplicación.
- No se han validado aquí builds, pruebas Android ni publicación Play Console.
- Esta hoja de ruta documenta decisiones, NO certifica que todas las funciones estén implementadas.

## Orden de ejecución recomendado
1. Reparar y verificar el arranque de Alpha.
2. Terminar dietas → menús compatibles → recetas → preparación y fotografías sin repetición.
3. Corregir dictado persistente y formularios.
4. Integrar Mi Plato Inteligente y conexiones de dispositivos.
5. Completar ejercicios, órganos, Keto y SOS.
6. Verificar accesibilidad, rendimiento, privacidad, pruebas y publicación.
