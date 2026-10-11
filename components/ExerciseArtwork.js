const fullPanels = new Set(["tai", "yoga", "chair", "wall", "bands", "strength", "step", "bed", "floor", "stretch", "warmup", "mobility", "balance", "cool"]);

export default function ExerciseArtwork({ item, photo = false }) {
  const [id, name] = item;
  const src = id === "walk"
    ? "/dietear-visuals/hd-ejercicio-fast.webp"
    : `/exercise-approved/${id}${photo || !fullPanels.has(id) ? "-photo" : ""}.webp`;
  return <img src={src} alt={name} loading="lazy" decoding="async" style={{display:"block",width:"100%",height:"auto"}} />;
}
