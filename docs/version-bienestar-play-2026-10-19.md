# DIETEAR · versión de alimentación y bienestar

Decisión de producto del 19 de octubre de 2026: mantener la alimentación y el bienestar y aplazar los controles clínicos. Se aplica a toda la web que abre la aplicación Android TWA, sin un modo oculto que vuelva a habilitar funciones médicas.

## Funciones activas

- Alimentación, estilos generales, recetas, alergias, intolerancias y exclusiones.
- Menú, nevera, aprovechamiento, presupuesto y lista de compra.
- Actividad cotidiana, hidratación, peso, medidas y descanso manual.
- Fichas familiares para organizar comidas y cantidades.
- Notas alimentarias del profesional, solo locales y sin aplicación automática.
- IA para alimentación y bienestar con selección explícita de campos y límite de ámbito en el servidor.

## Funciones aplazadas

- Analíticas, medicación, órganos, diagnósticos y evolución de enfermedades.
- Registros de glucosa, tensión y otras mediciones clínicas.
- Portal profesional y publicidad de conexiones con glucómetros o tensiómetros.
- Estilos terapéuticos (diabética, hiposódica, baja en fibra o residuos) en el selector activo.

Los componentes clínicos originales permanecen en el repositorio, sin importarse desde la aplicación activa. Reactivarlos requerirá una revisión expresa de producto, seguridad, validación y declaraciones; no se activa por parámetros de URL ni almacenamiento local.

## Conservación

No se migra ni elimina el historial clínico. Se conservan `careRecords`, los campos clínicos antiguos del perfil y el historial original al guardar cambios de bienestar. Los historiales clínicos cifrados y las antiguas fichas de nutrición familiar conservan sus claves locales sin accederse desde los componentes activos.

La vista de progreso proyecta solo tipos de bienestar admitidos. Las consultas automáticas proyectan campos permitidos, sin etiquetas/notas del historial, notas profesionales, nombres, datos clínicos antiguos ni claves desconocidas. El servidor vuelve a proyectar el contexto aunque un cliente antiguo o modificado envíe más campos. El texto que la persona escribe sigue siendo entrada libre: se informa de que no debe incluir datos clínicos.

El filtro de peticiones clínicas es una primera barrera determinista y no es un clasificador médico completo. Las instrucciones de ambos servicios limitan las respuestas al bienestar. Esto no demuestra que un modelo nunca pueda responder fuera de ámbito ni equivale a una certificación médica o aceptación de Google.

## Declaración prevista en Play Console

Una vez que la versión esté desplegada y verificada, declarar Actividad y forma física, Nutrición y control del peso y Gestión del sueño. No declarar seguimiento menstrual, gestión del estrés/cognición, funciones médicas o investigación que esta versión no ofrece. No declarar «sin funciones de salud»: nutrición, actividad y sueño siguen siendo funciones de salud para Google.

Revisar también la ficha publicada, la privacidad y Seguridad de los datos. La categoría y la declaración deben reflejar las funciones reales. Cambiar la declaración no garantiza que Google permita una cuenta personal ni resuelve por sí solo el rechazo.

Fuentes oficiales consultadas el 19 de octubre de 2026:
- https://support.google.com/googleplay/android-developer/answer/14738291?hl=es
- https://support.google.com/googleplay/android-developer/answer/13996367?hl=es
- https://support.google.com/googleplay/android-developer/answer/10788890?hl=es

La cuenta mantiene pendiente el acceso a producción: el panel observado exige una prueba cerrada con al menos 12 testers durante 14 días y mostraba 0 testers. La corrección del rechazo no publica automáticamente la aplicación.
