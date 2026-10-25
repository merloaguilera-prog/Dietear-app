import "./globals.css";
import "./design.css";
import "./color.css";
import "./data-entry.css";
import "./exercises.css";
import DataEntryAssistant from "../components/DataEntryAssistant";
import PwaRuntime from "../components/PwaRuntime";

export const metadata = {
  title: "DIETEAR · Todo suma",
  description: "Alimentación, planificación, actividad y progreso adaptados a tu vida.",
  applicationName: "DIETEAR",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DIETEAR",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#147a4f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <PwaRuntime />
        <DataEntryAssistant />
      </body>
    </html>
  );
}
