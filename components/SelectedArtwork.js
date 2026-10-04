import Image from "next/image";

const collage = "/dietear-visuals/seleccion-pantallas.png";
const assets = {
  inicio: ["/dietear-visuals/seleccion-portada.png", 1024, [470, 190, 545, 815]],
  alimentacion: [collage, 1536, [301, 93, 270, 124]],
  dietas: [collage, 1536, [610, 90, 111, 64]],
  plan: [collage, 1536, [985, 181, 105, 45]],
  recetas: [collage, 1536, [1205, 161, 73, 52]],
  compra: [collage, 1536, [301, 93, 270, 124]],
  nevera: [collage, 1536, [17, 617, 270, 163]],
  ejercicio: [collage, 1536, [312, 616, 266, 129]],
  progreso: [collage, 1536, [628, 861, 45, 60]],
  salud: [collage, 1536, [1034, 785, 105, 72]],
  conoce: [collage, 1536, [1207, 617, 300, 148]],
  crear: ["/dietear-visuals/seleccion-crear-dieta.png", 1024, [27, 109, 965, 255]],
  Equilibrada: [collage, 1536, [610, 90, 111, 64]],
  Mediterránea: [collage, 1536, [738, 90, 111, 64]],
  Hipocalórica: [collage, 1536, [610, 193, 111, 61]],
  Hipercalórica: [collage, 1536, [738, 193, 111, 61]],
  "Sin gluten": [collage, 1536, [610, 293, 111, 62]],
  "Sin lactosa": [collage, 1536, [738, 293, 111, 62]],
  Vegana: [collage, 1536, [610, 390, 111, 57]],
  Diabética: [collage, 1536, [738, 390, 111, 57]],
  Corazón: [collage, 1536, [924, 611, 99, 64]],
  Riñones: [collage, 1536, [1034, 611, 105, 64]],
  Pulmones: [collage, 1536, [924, 700, 99, 70]],
  Hígado: [collage, 1536, [1034, 700, 105, 70]],
  "Sistema digestivo": [collage, 1536, [924, 786, 99, 72]],
  Piel: [collage, 1536, [1034, 786, 105, 72]],
};

export const featureArtwork = {
  "Alimentación": "alimentacion", "Ejercicio": "ejercicio", "Mi Plan": "plan",
  "Mi Progreso": "progreso", "Mi Compra": "compra", "Mi Nevera": "nevera",
  "Salud": "salud", "Objetivos": "inicio", "Crear mi dieta": "crear",
  "¿Qué como hoy?": "recetas", "Menú semanal": "plan", "Todo Dietas": "dietas",
  "Recetas rápidas": "recetas", "Pasos y actividad": "ejercicio",
  "Salud y necesidades": "salud", "Analizar alimento": "conoce",
  "Crear semana": "dietas", "Modificar plan": "plan", "Generar compra": "compra",
};

// Display a region of the selected original, keeping raster assets unchanged.
// Painted controls are excluded; all controls in the app remain real HTML.
export default function SelectedArtwork({ name, className = "", decorative = true }) {
  const asset = assets[name];
  if (!asset) return null;
  const [src, sourceWidth, [x, y, width, height]] = asset;
  return <span className={"selectedArtwork " + className} style={{ aspectRatio: `${width}/${height}` }} aria-hidden={decorative || undefined}>
    <Image src={src} alt={decorative ? "" : name} width={sourceWidth} height={src === collage ? 1024 : 1536} unoptimized
      style={{ width: `${sourceWidth / width * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} />
  </span>;
}
