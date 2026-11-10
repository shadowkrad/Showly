import { headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { leggiSorgentiIconaPwa, pwaIconUrl } from "@/lib/pwa-icon-version";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandName, v } = await leggiSorgentiIconaPwa();
  const titleName = brandName || "Atelier Aurora";

  return {
    title: `${titleName} — Bottega Orafa & Manifattura d'Autore`,
    description:
      "Vetrina d'autore per creazioni artigianali. Esplora le collezioni still-life e riserva la tua prova gratuita in bottega.",
    icons: {
      icon: [
        { url: pwaIconUrl(32, v), sizes: "32x32", type: "image/png" },
        { url: pwaIconUrl(192, v), sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: pwaIconUrl(180, v), sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: titleName,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { v } = await leggiSorgentiIconaPwa();
  // La tessera del cliente ha icona (logo) e manifest propri, impostati dalla sua pagina
  const eTessera = ((await headers()).get("x-pathname") || "").startsWith("/tessera/");

  return (
    <html lang="it">
      <head>
        {!eTessera && (
          <>
            <link rel="icon" type="image/png" sizes="32x32" href={pwaIconUrl(32, v)} />
            <link rel="icon" type="image/png" sizes="192x192" href={pwaIconUrl(192, v)} />
            <link rel="apple-touch-icon" sizes="180x180" href={pwaIconUrl(180, v)} />
            <link rel="manifest" href="/manifest.webmanifest" />
          </>
        )}
      </head>
      <body className="bg-luxe-black text-luxe-light selection:bg-amber-400 selection:text-black antialiased min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
