// Catálogo inicial para la recuperación de «Muévete a tu ritmo».
// Datos separados de la interfaz para poder validar y ampliar las rutinas.
// No contiene prescripciones médicas ni sustituye la adaptación individual.
export const exerciseCategories = [
  { id: "tai-chi", title: "Taichí", level: "suave", equipment: [], exercises: ["respiracion-centro", "movimientos-brazos", "paso-lateral", "olas-manos"] },
  { id: "yoga", title: "Yoga en casa", level: "adaptable", equipment: ["esterilla"], exercises: ["saludo-sol-adaptado", "postura-gato", "guerrero-adaptado", "estiramiento-espalda"] },
  { id: "silla", title: "Ejercicios en silla", level: "adaptable", equipment: ["silla-estable"], exercises: ["elevacion-piernas-silla", "brazos-botellas", "giro-tronco-silla", "sentarse-levantarse"] },
  { id: "pared", title: "Ejercicios en la pared", level: "adaptable", equipment: ["pared"], exercises: ["sentadilla-pared", "flexiones-pared", "elevacion-talones", "apertura-pecho"] },
  { id: "bandas", title: "Bandas elásticas", level: "adaptable", equipment: ["banda-elastica"], exercises: ["remo-banda", "apertura-brazos-banda", "biceps-banda"] },
  { id: "fuerza", title: "Fuerza en casa", level: "adaptable", equipment: ["botellas-opcionales"], exercises: ["sentadillas", "press-hombros", "zancadas", "plancha-adaptada"] },
  { id: "escalon", title: "Escalón", level: "adaptable", equipment: ["escalon-estable"], exercises: ["subir-bajar-escalon", "paso-lateral-escalon"] },
  { id: "cama", title: "Ejercicios en cama", level: "suave", equipment: ["cama"], exercises: ["elevacion-piernas-cama", "puente-gluteos", "abdominales-suaves", "estiramiento-lumbar"] },
  { id: "suelo", title: "Suelo y core", level: "adaptable", equipment: ["esterilla"], exercises: ["plancha-adaptada", "elevacion-piernas", "puente-gluteos", "movilidad-cuadrupedia"] },
  { id: "estiramientos", title: "Estiramientos", level: "suave", equipment: [], exercises: ["cuello-hombros", "espalda", "piernas", "cadera"] },
  { id: "calentamiento", title: "Calentamiento", level: "suave", equipment: [], exercises: ["marcha-sitio", "movilidad-articular", "pasos-laterales"] },
  { id: "movilidad", title: "Movilidad y equilibrio", level: "adaptable", equipment: ["apoyo-opcional"], exercises: ["movilidad-cuello", "equilibrio-pierna", "movilidad-hombros"] },
  { id: "cardio", title: "Cardio suave", level: "adaptable", equipment: [], exercises: ["caminar", "marcha-sitio", "elevacion-rodillas"] },
  { id: "objetos-casa", title: "Con objetos de casa", level: "adaptable", equipment: ["botellas", "palo-escoba"], exercises: ["remo-botellas", "biceps-botellas", "movilidad-palo-escoba"] },
  { id: "principiantes", title: "Principiantes", level: "suave", equipment: [], exercises: ["caminar", "sentarse-levantarse", "movilidad-articular"] },
  { id: "movilidad-reducida", title: "Movilidad reducida", level: "adaptable", equipment: ["silla-estable"], exercises: ["elevacion-piernas-silla", "movilidad-hombros", "brazos-botellas"] }
];
// Las imágenes de referencia facilitadas en la conversación deben convertirse
// en recursos individuales optimizados y con permisos de uso verificados antes
// de asociar rutas image a cada categoría o ejercicio.
