import FloatingWhatsAppWidget from "@/components/FloatingWhatsAppWidget";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atelier Aurora — Bottega Orafa & Manifattura d'Autore",
  description:
    "Vetrina d'autore per creazioni artigianali. Esplora le collezioni still-life e riserva la tua prova gratuita in bottega.",
  icons: {
    icon: [
      { url: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/api/pwa-icon?size=180", sizes: "180x180", type: "image/png" }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Showly",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/api/pwa-icon?size=192" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/api/pwa-icon?size=180" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="bg-luxe-black text-luxe-light selection:bg-amber-400 selection:text-black antialiased min-h-screen flex flex-col overflow-x-hidden">
        {children}
      <FloatingWhatsAppWidget />
      </body>
    </html>
  );
}
