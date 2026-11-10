import { MetadataRoute } from "next";
import { leggiSorgentiIconaPwa, pwaIconUrl } from "@/lib/pwa-icon-version";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { brandName: loadedName, accentColor, v } = await leggiSorgentiIconaPwa();
  const brandName = loadedName || "Showly";
  const themeColor = accentColor || "#f59e0b";

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
        src: pwaIconUrl(192, v),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: pwaIconUrl(512, v),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: pwaIconUrl(512, v, { maskable: true }),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
