# Mi dieta por puntos

La dieta «Por puntos» aparece en las galerías de Alimentación y abre una sección propia con imagen, diario, guía de alimentos, recetas y calculadora. La selección guarda el estilo sin sustituir el calendario semanal por una dieta distinta.

## Método y datos

- Se conserva el método propio que ya utilizaba DIETEAR: **1 punto = 50 kcal**. No reproduce WeightWatchers ni una tabla comercial.
- Los nuevos registros redondean a una décima después de sumar la energía y dividir las raciones. Un plato incluye todos los ingredientes, aceite, salsas y acompañamientos introducidos.
- El ejemplo inicial de 30 puntos es editable; no es una recomendación personal. No se calculan límites por peso ni se conceden extras o compensaciones. La referencia semanal es la diaria multiplicada por siete.
- Las 172 referencias proceden de **USDA FoodData Central, SR Legacy, abril de 2018**, nutriente 1008 (kcal). Se conservan identificador FDC, descripción original, estado crudo/cocinado y energía por 100 g comestibles. Las porciones son ejemplos editables, no tamaños prescritos.
- `scripts/build-points-catalog.py` reproduce el catálogo a partir del archivo oficial. Los valores de productos y preparaciones particulares pueden diferir; la calculadora por etiqueta permite introducir sus kcal/100 g o kcal/100 ml y la cantidad consumida en la misma unidad.
- Las 64 recetas reutilizan el catálogo y las imágenes existentes. Para poder calcular ingredientes genéricos, esta sección muestra versiones explícitas: pimiento rojo, manzana, bacalao, mezcla de calabacín/zanahoria o fresas/arándanos. Estas decisiones se explican en cada receta. El catálogo compartido del planificador no se modifica.
- Las cantidades originales de las recetas son por ración. Las conversiones orientativas de unidades y mililitros a peso comestible son visibles; la calculadora permite corregirlas. Un ingrediente desconocido o un peso incompleto bloquean el cálculo y el registro.

Fuentes: [datos descargables USDA](https://fdc.nal.usda.gov/download-datasets/), [documentación USDA](https://fdc.nal.usda.gov/data-documentation/), [recomendaciones dietéticas AESAN](https://www.aesan.gob.es/actualidad/actualidad-noticias/recomendaciones_dieteticas).

## Imágenes y créditos

La cabecera, la ilustración de los nueve grupos y los atlas de alimentos se crearon para DIETEAR con generación de imágenes. Son ilustraciones: los puntos y las cantidades se calculan y muestran en HTML, nunca se extraen de los dibujos. Las referencias visuales compartidas se usaron para orientar el estilo de grupos y cabeceras de colores; sus tablas nutricionales y fotografías no se copiaron.

`lib/points-illustrations.json` asigna una celda única de un atlas a cada alimento ilustrado. Cada atlas tiene cuatro columnas y seis filas; se muestra la celda con un viewport SVG, sin modificar los originales. Los atlas y los grupos utilizan la optimización de imágenes de Next para reducir la transferencia en móvil. El archivo de nueve grupos tiene tres columnas y tres filas. Las imágenes están en `public/dietear-visuals/points-*`.

Las fotografías restantes se guardan localmente en `public/points-foods`. `lib/points-photos.json` conserva autor, página original y licencia individual. El desplegable «Fuente e imagen» muestra el crédito junto al alimento. Se aceptan dominio público, CC0, CC BY y CC BY-SA; se excluyen NC y ND. `scripts/fetch-points-photos.py` conserva las ilustraciones asignadas y descarga únicamente referencias pendientes. La búsqueda visual sirve para localizar imágenes, no como fuente nutricional.

### Instrucciones de generación

- **Cabecera:** fotografía ilustrativa apetitosa de un plato mediterráneo con pollo, arroz, brócoli, tomate y zanahoria, sobre mesa verde salvia, aceite de oliva y hierbas; composición luminosa sin texto, cifras, marcas ni envases.
- **Nueve grupos:** cuadrícula exacta 3 × 3 con recortes realistas de alimentos sobre fondo blanco. Orden: fruta; verduras; legumbres/proteína vegetal; cereales/tubérculos; lácteos/huevos; carnes/pescados; frutos secos/semillas; aceites/condimentos; bebidas/otros. Sin texto ni puntuaciones.
- **Atlas 1 y 2:** cuadrícula exacta 4 × 6, cada alimento completo y centrado en su celda con márgenes blancos, luz natural uniforme y sombra suave; aspecto de fotografía realista, sin texto, cifras, animales vivos ni diagramas. Se pidió respetar el estado crudo/cocinado, separar las celdas y seguir el orden registrado en el JSON. El primer atlas contiene frutas, verduras, cereales, huevo, leche, yogur y pollo crudo. El segundo contiene proteínas, semillas, condimentos y legumbres cocidas.
- **Atlas 3:** mismo estilo y cuadrícula 4 × 6; pasta cocida, clara sin yema, remolacha cocida, pimiento rojo; espárragos cosechados, pistachos, anacardos y cacahuetes pelados; arándanos, moras, dátiles, espinacas; lechuga, pepino, berenjena, coles de Bruselas; hinojo, judías verdes, piña, aguacate; limón, lima, albaricoque, kiwi. Porciones de alimento comestible, sin tierra, plantas en el campo, letras ni números.

## Persistencia y compatibilidad

Se mantiene `dietear-points-v1`. Los puntos históricos no se recalculan. Los nuevos registros añaden fecha local, momento del día, energía y versión del método. El diario utiliza semanas de lunes a domingo; un cambio de día actualiza la selección si seguía en hoy. Los datos se guardan en el navegador, sin sincronización entre dispositivos. Si el registro es ilegible, se conserva su contenido y se bloquean nuevas escrituras; un fallo de guardado se comunica en pantalla.

Se respeta el comprobador de exclusiones existente del perfil para alimentos, recetas e ingredientes. La coincidencia de nombres no constituye un catálogo clínico completo de alérgenos; el usuario debe revisar ingredientes y etiquetas.

## Verificación

`npm run test:points` comprueba fuentes y estados de los alimentos, puntuación de porciones, suma del aceite y división antes del redondeo, bloqueo de referencias incompletas, conversiones, semanas y fechas locales, compatibilidad histórica, búsquedas sin acentos, las 64 recetas y la cobertura/licencia de las imágenes.

La revisión de navegador comprueba selección desde la galería, registro por ración y etiqueta, calculadora, persistencia tras recargar, borrado, referencias diarias/semanales, pantalla móvil, guía y conservación de datos ilegibles. La compilación de producción se valida por separado.

Esta mejora web no modifica el AAB Android, los canales de Google Play, los participantes ni la publicación en producción. La apertura de la aplicación Android requiere una comprobación independiente en un dispositivo con la versión instalada identificada.

### Resultado del 21 de octubre de 2026

- `npm run build`: correcto.
- `npm run test:points`: 10 pruebas correctas.
- Chromium, compilación de producción local: 26 comprobaciones correctas, sin errores de ejecución ni recursos locales fallidos, en pantallas de 1440 y 390 px. Incluye búsqueda, las 64 recetas, etiqueta por gramos/mililitros, suma del aceite y raciones, recarga, borrado, datos ilegibles, exclusión del perfil y los tres atlas optimizados. [Detalle](points-diet-qa.json).
- Los atlas de alimentos se sirven como WebP de aproximadamente 116–159 kB cada uno, conservando los PNG originales.

Capturas con datos ficticios de revisión: [mi día en escritorio](points-diet-desktop.png), [guía por grupos](points-diet-groups.png) y [alimento en móvil](points-diet-mobile.png). La referencia de 26 puntos visible en las capturas es un dato de prueba, no una recomendación.
