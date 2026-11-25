# Libros de recetas diferenciados

Selecciones revisadas el 25/11/2026 a partir de las 64 recetas existentes. No se han eliminado recetas ni cambiado identificadores, ingredientes, cantidades, imágenes o planes guardados.

## Alcance

- Ocho libros con 16 recetas cada uno, antes de aplicar exclusiones personales o «No me gusta».
- Un máximo de cinco recetas compartidas entre dos libros y dos libros por receta.
- Las tres primeras propuestas de cada libro son distintas de las de los otros siete; se conserva el orden editorial al mostrarlo.
- «Ver más recetas compatibles» abre el catálogo completo tras comprobar los ingredientes; «Mis favoritas» conserva acceso a recetas compatibles guardadas fuera de la selección.
- La selección se aplica a «Crear mi dieta» y «Todo Dietas». La búsqueda de recetas rápidas y el generador de semanas conservan el catálogo compatible existente; el límite de coincidencias corresponde a los ocho libros iniciales.
- Los estilos sin recetario propio revisado indican que está pendiente; sus ideas generales se abren aparte y no se presentan como una dieta específica. La adecuación clínica, trazas, certificaciones y nutrición por ingrediente siguen pendientes de validación.

## Coincidencias entre libros

| Libro | Equilibrada | Mediterránea | Vegana | Vegetariana | Sin lactosa | Sin gluten | Mantenimiento | Sin alimento X |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Equilibrada | 16 | 3 | 1 | 5 | 1 | 0 | 5 | 1 |
| Mediterránea | 3 | 16 | 0 | 2 | 2 | 3 | 3 | 3 |
| Vegana | 1 | 0 | 16 | 0 | 5 | 5 | 1 | 4 |
| Vegetariana | 5 | 2 | 0 | 16 | 0 | 3 | 4 | 2 |
| Sin lactosa | 1 | 2 | 5 | 0 | 16 | 3 | 1 | 4 |
| Sin gluten | 0 | 3 | 5 | 3 | 3 | 16 | 1 | 1 |
| Mantenimiento | 5 | 3 | 1 | 4 | 1 | 1 | 16 | 1 |
| Sin alimento X | 1 | 3 | 4 | 2 | 4 | 1 | 1 | 16 |

## Verificación

`npm test`, `npm run build` y recorridos E2E web/escritorio y tamaño móvil. Las pruebas contrastan los IDs con el catálogo real, filtros de ingredientes, límites de coincidencias, catálogo ampliado, favoritos, cambio de estilo y estado de los libros pendientes. Evidencia de CI en el PR #51.
