// Original 3D food illustrations created for DIETEAR, November 2026.
// Aliases describe the same diet in different selectors; each selector has unique images.
export const dietArtwork = {
  "Equilibrada": "equilibrada",
  "Mediterránea": "mediterranea",
  "Vegana": "vegana",
  "Vegetariana": "vegetariana",
  "Sin gluten": "sin-gluten",
  "Sin lactosa": "sin-lactosa",
  "Hiposódica": "hiposodica",
  "Musulmana / Halal": "halal",
  "Diabética": "diabetica",
  "Hipocalórica": "hipocalorica",
  "Hipercalórica": "hipercalorica",
  "Alta en proteína": "alta-proteina",
  "Rica en proteínas": "rica-proteina",
  "Ganar músculo": "musculo",
  "Ganancia muscular": "musculo",
  "Rica en fibra": "rica-fibra",
  "Baja en fibra": "baja-fibra",
  "Baja en residuos": "baja-residuos",
  "Pérdida de grasa saludable": "perdida-grasa",
  "Por puntos (equilibrada)": "puntos",
  "Dieta por puntos": "puntos",
  "Ayuno intermitente": "ayuno",
  "Baja en grasas saturadas": "grasas-saludables",
  "Sin alimento X": "exclusion",
  "Mantenimiento": "mantenimiento",
  "Sin azúcar añadido": "sin-azucar",
};

export const dietArtworkPath = name => dietArtwork[name]
  ? `/dietear-visuals/dietas-3d/${dietArtwork[name]}.webp`
  : null;
