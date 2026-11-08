import QRCode from "qrcode";
import { prisma, ensureDatabase } from "@/lib/db";
import { leggiBrandShowly } from "@/lib/brand-locale";
import { leggiConfigSalvata } from "@/lib/anagrafica-attivita";
import {
  CartaGraficaConfig,
  DatiAttivitaCarta,
  OrarioGiornoCarta,
  normalizzaCartaGraficaConfig,
} from "@/lib/carta-grafica-types";

export async function caricaCartaGrafica(origineUrl?: string): Promise<{
  config: CartaGraficaConfig;
  attivita: DatiAttivitaCarta;
}> {
  await ensureDatabase();
  const [brand, salvata] = await Promise.all([
    leggiBrandShowly(),
    leggiConfigSalvata(),
  ]);

  const rawJson = salvata || {};
  const nome = (brand.brandName || rawJson?.brand?.name || "Atelier Showly").trim();
  const colorePrimario = (brand.primaryColor || "#18181b").trim();
  const coloreAccento = (brand.accentColor || "#C9A86A").trim();

  const config = normalizzaCartaGraficaConfig(rawJson?.cartaGrafica, {
    defaultPreset: "CLASSICO_ORO",
    coloreScuro: colorePrimario.startsWith("#") ? colorePrimario : "#18181b",
    coloreChiaro: "#EAE0D0",
    coloreDettaglio: coloreAccento.startsWith("#") ? coloreAccento : "#C9A86A",
    sottotitoloBrand: "ATELIER & SHOWROOM",
  });

  const feriali = (rawJson?.atelier?.hoursWeekdayText || "09:30 - 13:00 / 15:30 - 19:30").replace(/^.*?:s*/, "").trim();
  const sabato = (rawJson?.atelier?.hoursSaturdayText || "09:30 - 19:30").replace(/^.*?:s*/, "").trim();
  const domenica = (rawJson?.atelier?.hoursSundayText || "CHIUSO").replace(/^.*?:s*/, "").trim();

  const orariGiornalieri: OrarioGiornoCarta[] = [
    { giorno: "LUNEDÌ", orario: feriali, chiuso: /chiuso/i.test(feriali) },
    { giorno: "MARTEDÌ", orario: feriali, chiuso: /chiuso/i.test(feriali) },
    { giorno: "MERCOLEDÌ", orario: feriali, chiuso: /chiuso/i.test(feriali) },
    { giorno: "GIOVEDÌ", orario: feriali, chiuso: /chiuso/i.test(feriali) },
    { giorno: "VENERDÌ", orario: feriali, chiuso: /chiuso/i.test(feriali) },
    { giorno: "SABATO", orario: sabato, chiuso: /chiuso/i.test(sabato) },
    { giorno: "DOMENICA", orario: domenica, chiuso: /chiuso/i.test(domenica) },
  ];

  const orariRaggruppati: OrarioGiornoCarta[] = [
    { giorno: "LUNEDÌ - VENERDÌ", orario: feriali, chiuso: /chiuso/i.test(feriali) },
    { giorno: "SABATO", orario: sabato, chiuso: /chiuso/i.test(sabato) },
    { giorno: "DOMENICA", orario: domenica, chiuso: /chiuso/i.test(domenica) },
  ];

  const sitoUrl = (origineUrl || "https://showly.taaaac.eu").trim();
  let qrVetrinaDataUrl = "";
  try {
    qrVetrinaDataUrl = await QRCode.toDataURL(sitoUrl, { margin: 1, width: 280, errorCorrectionLevel: "M" });
  } catch {}

  const attivita: DatiAttivitaCarta = {
    nome,
    slogan: (rawJson?.brand?.subtitle || "").trim(),
    indirizzo: (brand.indirizzo || rawJson?.atelier?.addressText || "").trim(),
    citta: "",
    telefono: (brand.phone || rawJson?.atelier?.whatsappButtonText || "").trim(),
    email: (rawJson?.business?.email || "").trim(),
    sitoUrl,
    qrVetrinaDataUrl,
    logoUrl: brand.logoUrl || null,
    logoHeroUrl: null,
    colorePrimario,
    coloreSecondario: "#EAE0D0",
    orariGiornalieri,
    orariRaggruppati,
  };

  return { config, attivita };
}

export async function salvaCartaGrafica(nuovaConfig: unknown): Promise<CartaGraficaConfig> {
  await ensureDatabase();
  const imp = await prisma.impostazioni.findUnique({ where: { id: "singleton" } });
  let rawJson: Record<string, any> = {};
  try {
    if (imp?.showcaseConfig) {
      rawJson = typeof imp.showcaseConfig === "string" ? JSON.parse(imp.showcaseConfig) : imp.showcaseConfig;
    }
  } catch {
    rawJson = {};
  }

  const configNormalizzata = normalizzaCartaGraficaConfig(nuovaConfig, {
    defaultPreset: "CLASSICO_ORO",
    coloreScuro: "#18181b",
    coloreChiaro: "#EAE0D0",
    coloreDettaglio: "#C9A86A",
    sottotitoloBrand: "ATELIER & SHOWROOM",
  });

  rawJson.cartaGrafica = configNormalizzata;

  await prisma.impostazioni.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", showcaseConfig: JSON.stringify(rawJson) },
    update: { showcaseConfig: JSON.stringify(rawJson) },
  });

  return configNormalizzata;
}
