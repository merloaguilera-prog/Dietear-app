# DIETEAR — auditoría de peticiones (octubre–noviembre 2026)

Documento de seguimiento. «Preparado» significa código en rama de trabajo, NO función probada ni desplegada. No fusionar ni publicar sin pruebas de regresión y aceptación móvil.

## P0 — bloqueos de uso y seguridad
- [ ] Android/Play: instalación, arranque, ANR/crash y pantalla en inglés de los probadores; probar en varios dispositivos y versiones Android; verificar el AAB de prueba cerrada.
- [ ] Registro/inicio de sesión funcional; permisos, privacidad y protección de fichas de salud y menores.
- [ ] Dietas individuales simultáneas: cada persona debe conservar su dieta, alergias, intolerancias, exclusiones, cantidades y menús; combinar solo ingredientes compatibles en compra global.
- [ ] Seguridad de alérgenos: no confundir «sin lactosa» con «sin proteínas de leche»; verificar etiquetas, ingredientes, trazas y sustituciones; no generar dietas clínicas automáticas.
- [ ] Verificar que los cambios de perfil y menús no sobrescriben datos de otros familiares ni semanas previas.

## P1 — funcionalidades solicitadas
- [x] Preparado en rama: perfiles familiares con estilo de alimentación e intolerancias individuales (sin generación individual todavía).
- [x] Preparado en rama: compra semanal agrupada de recetas y cantidades manuales explícitas; faltan tests y productos sin cantidad.
- [x] Preparado en rama: avance automático de semana y archivo de semanas previas; faltan pruebas de cambio de año, zona horaria y datos persistidos.
- [ ] Compra única de toda la familia, cantidades/unidades y existencias de Mi Nevera, presupuesto, productos comprados, escáner y dictado.
- [ ] Planificación individual y familiar con dietas simultáneas, cambios de plato, snacks, comidas flexibles, día comodín y calendario real.
- [ ] Dictado de datos que se GUARDE y avance de campo; probar permisos Android/Chrome.
- [ ] Mi plato inteligente, foto y estimación revisable de gramos, nutrientes y registro de comidas.
- [ ] Qué como ahora: voz, cantidades, búsqueda y botón para borrar; cobertura de alimentos sin datos.
- [ ] Ayuno intermitente y dieta por puntos solo para adultos cuando corresponda; no abrir por defecto.
- [ ] Platos saludables: más guisos calientes, salmorejo, espeto, gazpachuelo, snacks; alternativas por dieta.
- [ ] Recetarios por dieta: objetivo ~100 Premium por dieta, ingredientes, preparación, imágenes reales HD únicas, macros verificados, Cambiar/No me gusta/Favorito y rotación mensual.
- [ ] Imágenes: eliminar duplicados, oscuras y semánticamente incorrectas; mantener diseño natural, fondos claros y marcos verde neón.
- [ ] Ejercicios con instrucciones, niveles y numeración correlativa; integración de actividad, hábitos y motivación.
- [ ] Salud: fichas individuales, registros (glucosa, tensión, pulso, peso, oxígeno, temperatura, colesterol, hemoglobina), historial, gráficas, CSV y seguridad.
- [ ] Imágenes reales de órganos restantes, educación sanitaria, cortisol/estrés, colesterol y primeros auxilios públicos.
- [ ] Dispositivos: Health Connect y otras conexiones solo si realmente autorizadas y disponibles; no simular sincronización.
- [ ] Conoce lo que comes: escáner, análisis y comparaciones conectados a alergias, Mi Nevera, Mi Compra y Mi Plan.
- [ ] Mi día, jardín de hábitos, sueño, hidratación, medicación, familia y recordatorios coherentes.
- [ ] Gratis con publicidad discreta y Premium 2,99 €/mes o 29,99 €/año sin anuncios; verificar cobros y control de acceso antes de anunciarlo.
- [ ] Informes profesionales/exportación y posibles perfiles profesionales, con controles de privacidad.
- [ ] Publicación: declaraciones de Play, recursos gráficos originales, compatibilidad, pruebas cerradas y aceptación.

## Criterios para marcar terminado
1. Función implementada y enlazada a las pantallas existentes, sin cambiar el diseño general.
2. Datos persistentes, errores visibles y privacidad adecuada.
3. Pruebas automáticas relevantes y prueba real móvil con 1 y 2 personas, dietas incompatibles y restricciones.
4. Comprobación del build web y Android; solo entonces decidir integrar en producción o Play.
