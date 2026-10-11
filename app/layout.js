import "./globals.css";
import "./design.css";
import "./color.css";
export const metadata={title:"DIETEAR · Todo suma",description:"Alimentación, planificación, actividad y progreso adaptados a tu vida.",icons:{icon:"/dietear-visuals/seleccion-icono-fast.webp",apple:"/dietear-visuals/seleccion-icono-fast.webp"}};
export default function RootLayout({children}){return <html lang="es"><body>{children}</body></html>}