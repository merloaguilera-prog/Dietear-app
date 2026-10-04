import { useId } from "react";

const collage = "/dietear-visuals/seleccion-pantallas.png";
const assets = {
  "pantalla-01": [collage, 1536, [0, 0, 285, 536]],
  "pantalla-02": [collage, 1536, [286, 0, 297, 536]],
  "pantalla-03": [collage, 1536, [584, 0, 302, 536]],
  "pantalla-04": [collage, 1536, [887, 0, 304, 536]],
  "pantalla-05": [collage, 1536, [1192, 0, 344, 536]],
  "pantalla-07": [collage, 1536, [0, 538, 305, 474]],
  "pantalla-08": [collage, 1536, [307, 538, 307, 474]],
  "pantalla-09": [collage, 1536, [615, 538, 306, 474]],
  "pantalla-10": [collage, 1536, [922, 538, 306, 474]],
  "pantalla-11": [collage, 1536, [1229, 538, 307, 474]],
  inicio: ["/dietear-visuals/inicio-completo.png", 1228, [0, 0, 1228, 1281], 1281],
  alimentacion: [collage, 1536, [301, 93, 270, 124]],
  dietas: [collage, 1536, [610, 90, 111, 64]],
  "plan-desayuno": [collage, 1536, [996, 180, 119, 45]],
  "plan-media": [collage, 1536, [996, 235, 119, 43]],
  "plan-almuerzo": [collage, 1536, [996, 286, 119, 45]],
  "plan-merienda": [collage, 1536, [996, 340, 119, 45]],
  "plan-cena": [collage, 1536, [996, 394, 119, 45]],
  plan: [collage, 1536, [996, 180, 119, 49]],
  recetas: [collage, 1536, [1205, 165, 112, 62]],
  compra: [collage, 1536, [301, 93, 270, 124]],
  nevera: [collage, 1536, [17, 617, 270, 163]],
  ejercicio: [collage, 1536, [312, 616, 266, 129]],
  progreso: [collage, 1536, [638, 855, 61, 64]],
  salud: [collage, 1536, [965, 608, 103, 65]],
  conoce: [collage, 1536, [1207, 617, 300, 148]],
  crear: ["/dietear-visuals/seleccion-crear-dieta.png", 1024, [27, 109, 965, 255]],
  Equilibrada: [collage, 1536, [610, 90, 111, 64]],
  Mediterránea: [collage, 1536, [738, 90, 111, 64]],
  Hipocalórica: [collage, 1536, [610, 193, 111, 61]],
  Hipercalórica: [collage, 1536, [738, 193, 111, 61]],
  "Sin gluten": [collage, 1536, [610, 293, 111, 62]],
  "Sin lactosa": [collage, 1536, [738, 293, 111, 62]],
  Vegana: [collage, 1536, [610, 390, 111, 49]],
  Diabética: [collage, 1536, [738, 390, 111, 49]],
  Corazón: [collage, 1536, [965, 608, 103, 65]],
  Riñones: [collage, 1536, [1080, 608, 115, 65]],
  Pulmones: [collage, 1536, [965, 701, 103, 62]],
  Hígado: [collage, 1536, [1080, 701, 115, 62]],
  "Sistema digestivo": [collage, 1536, [965, 787, 103, 63]],
  Piel: [collage, 1536, [1080, 787, 115, 63]],
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

// SVG viewports keep the selected region intact at every container size.
// The source raster stays unchanged; real app controls live outside the artwork.
export default function SelectedArtwork({ name, className = "", decorative = true }) {
  const clipId = useId();
  const asset = assets[name];
  if (!asset) return null;
  const [src, sourceWidth, [x, y, width, height], sourceHeight = src === collage ? 1024 : 1536] = asset;
  return <span className={"selectedArtwork " + className} data-artwork={name}
    style={{ "--art-width": `${width * 2}px`, "--art-ratio": `${width} / ${height}` }}
    aria-hidden={decorative || undefined}>
    <svg viewBox={`${x} ${y} ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
      role={decorative ? undefined : "img"} aria-label={decorative ? undefined : name}>
      <defs><clipPath id={clipId}><rect x={x} y={y} width={width} height={height}/></clipPath></defs>
      <image href={src} width={sourceWidth} height={sourceHeight} clipPath={`url(#${clipId})`} />
    </svg>
  </span>;
}
