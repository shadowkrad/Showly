import { prisma } from "@/lib/db";

/** Nome, logo, colore e recapiti dell'atelier (impostazioni + configurazione vetrina). */
export async function leggiBrandShowly() {
  const imp = await prisma.impostazioni.findUnique({ where: { id: "singleton" } }).catch(() => null);
  let cfg: any = {};
  try {
    cfg = imp?.showcaseConfig ? JSON.parse(imp.showcaseConfig) : {};
  } catch {
    cfg = {};
  }
  return {
    brandName: (cfg?.brand?.name as string) || imp?.nomeAttivita || "Atelier",
    accentColor: (cfg?.brand?.accentColor as string) || "#D4AF37",
    primaryColor: "#1c1917",
    logoUrl: (cfg?.brand?.logoUrl as string) || null,
    phone: imp?.telefono || "",
    indirizzo: imp?.indirizzo || "",
  };
}

/** Stessa informazione di `leggiBrandShowly`, nella forma usata dalle pagine pubbliche (tessera, icona, manifest). */
export async function impDaBrand() {
  return leggiBrandShowly();
}
