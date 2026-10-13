export default function manifest() {
  return {
    id: "/",
    name: "DIETEAR · Todo suma",
    short_name: "DIETEAR",
    description:
      "Alimentación, planificación, actividad y progreso adaptados a tu vida.",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f7fbf5",
    theme_color: "#147a4f",
    lang: "es-ES",
    categories: ["health", "fitness", "food", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Mi alimentación",
        short_name: "Alimentación",
        url: "/?section=food&source=shortcut",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Mi plan",
        short_name: "Mi plan",
        url: "/?section=plan&source=shortcut",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Mi progreso",
        short_name: "Progreso",
        url: "/?section=progress&source=shortcut",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
