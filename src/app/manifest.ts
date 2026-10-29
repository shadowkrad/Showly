import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let brandName = "Showly";
  let themeColor = "#f59e0b";

  try {
    const imp = await prisma.impostazioni.findUnique({
      where: { id: "singleton" },
    });
    if (imp?.nomeAttivita) {
      brandName = imp.nomeAttivita;
    }
    if (imp?.showcaseConfig && imp.showcaseConfig !== "{}") {
      try {
        const parsed = JSON.parse(imp.showcaseConfig);
        if (parsed?.brand?.name) brandName = parsed.brand.name;
        if (parsed?.brand?.accentColor) themeColor = parsed.brand.accentColor;
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.error("[PWA Manifest Showly] Fallback su default:", err);
  }

  return {
    name: `${brandName} — Bottega d'Autore & Showroom`,
    short_name: brandName,
    description: `Vetrina still-life e atelier per ${brandName}, parte dell'ecosistema Taaaac.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: themeColor,
    icons: [
      {
        src: "/api/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
