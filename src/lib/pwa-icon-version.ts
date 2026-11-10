import crypto from "crypto";
import { prisma } from "@/lib/db";

export interface SorgentiIconaPwa {
  faviconUrl: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  brandName: string;
  v: string;
}

/** Primi 8 caratteri SHA-1 di `faviconUrl|logoUrl` per invalidare la cache a ogni cambio icona/logo. */
export function calcolaHashIcona(faviconUrl?: string | null, logoUrl?: string | null): string {
  const raw = `${(faviconUrl || "").trim()}|${(logoUrl || "").trim()}`;
  return crypto.createHash("sha1").update(raw).digest("hex").slice(0, 8);
}

/** Primi 8 caratteri SHA-1 per l'icona della tessera fedeltà digitale (`/tessera/[token]/icona`). */
export function calcolaHashLogoTessera(
  logoUrl?: string | null,
  accento?: string | null,
  nome?: string | null
): string {
  const raw = `${(logoUrl || "").trim()}|${(accento || "").trim()}|${(nome || "").trim()}`;
  return crypto.createHash("sha1").update(raw).digest("hex").slice(0, 8);
}

/** Costruisce l'URL versionato verso `/api/pwa-icon`. */
export function pwaIconUrl(size: number, v: string, opts?: { maskable?: boolean }): string {
  const mask = opts?.maskable ? "&maskable=1" : "";
  const ver = v ? `&v=${encodeURIComponent(v)}` : "";
  return `/api/pwa-icon?size=${size}${mask}${ver}`;
}

/** Legge favicon, logo, nome e colori da `Impostazioni` (`showcaseConfig`) e calcola il codice versione `v`. */
export async function leggiSorgentiIconaPwa(): Promise<SorgentiIconaPwa> {
  let faviconUrl: string | null = null;
  let logoUrl: string | null = null;
  let primaryColor = "#0f172a";
  let accentColor = "#f59e0b";
  let brandName = "Atelier Aurora";

  try {
    const imp = await prisma.impostazioni.findUnique({
      where: { id: "singleton" },
    });

    if (imp?.nomeAttivita?.trim()) {
      brandName = imp.nomeAttivita.trim();
    }

    if (imp?.showcaseConfig && imp.showcaseConfig !== "{}") {
      try {
        const parsed = JSON.parse(imp.showcaseConfig);
        if (typeof parsed?.brand?.name === "string" && parsed.brand.name.trim()) {
          brandName = parsed.brand.name.trim();
        }
        if (typeof parsed?.brand?.faviconUrl === "string" && parsed.brand.faviconUrl.trim()) {
          faviconUrl = parsed.brand.faviconUrl.trim();
        }
        if (typeof parsed?.brand?.logoUrl === "string" && parsed.brand.logoUrl.trim()) {
          logoUrl = parsed.brand.logoUrl.trim();
        }
        if (typeof parsed?.brand?.accentColor === "string" && parsed.brand.accentColor.trim()) {
          accentColor = parsed.brand.accentColor.trim();
          primaryColor = parsed.brand.accentColor.trim();
        }
      } catch {
        // ignora JSON non valido
      }
    }
  } catch {
    // fallback sicuro se DB non ancora pronto
  }

  return {
    faviconUrl,
    logoUrl,
    primaryColor,
    accentColor,
    brandName,
    v: calcolaHashIcona(faviconUrl, logoUrl),
  };
}

export async function getPwaIconVersion(): Promise<string> {
  const s = await leggiSorgentiIconaPwa();
  return s.v;
}
