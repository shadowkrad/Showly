/**
 * Fonte unica dei dati dell'attività (Showly).
 *
 * - Nome, sede, telefono, email, descrizione e ORARI della bottega si modificano SOLO in Impostazioni.
 *   Vetrina, Google, Facebook e Instagram li leggono da lì.
 * - Colori, logo e foto si modificano SOLO nello Studio.
 * Lo Studio mostra questi dati in sola lettura: quando salva, i valori dell'attività restano quelli già salvati.
 */
import { prisma } from "@/lib/db";
import type { OmnichannelDayHours, OmnichannelSpecialClosure } from "@/lib/omnichannel-client";

/** Trasforma un testo tipo "Lun – Ven: 09:30 – 13:00 | 15:30 – 19:30" nelle fasce di apertura ("Chiuso" = nessuna fascia). */
export function leggiFasce(testo: string | null | undefined): Array<{ open: string; close: string }> {
  if (!testo || /chiuso/i.test(testo)) return [];
  const fasce: Array<{ open: string; close: string }> = [];
  for (const m of testo.matchAll(/(\d{1,2}[:.]\d{2})\s*[-–—]\s*(\d{1,2}[:.]\d{2})/g)) {
    fasce.push({
      open: m[1].replace(".", ":").padStart(5, "0"),
      close: m[2].replace(".", ":").padStart(5, "0"),
    });
  }
  return fasce;
}

/** Orari ufficiali nel formato di Google Maps / Facebook / Instagram (giorni di chiusura inclusi). */
export function orariUfficialiPerCanali(config: any | null): OmnichannelDayHours[] {
  const a = config?.atelier || {};
  const feriali = leggiFasce(a.hoursWeekdayText);
  const sabato = leggiFasce(a.hoursSaturdayText);
  const domenica = leggiFasce(a.hoursSundayText);
  const giorni: OmnichannelDayHours["dayOfWeek"][] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
  ];
  return giorni.map((dayOfWeek, i) => {
    const slots = i < 5 ? feriali : i === 5 ? sabato : domenica;
    return { dayOfWeek, isOpen: slots.length > 0, slots };
  });
}

/** Prossime chiusure straordinarie dal calendario eccezioni. */
export async function chiusureFuture(): Promise<OmnichannelSpecialClosure[]> {
  try {
    const oggi = new Date().toISOString().slice(0, 10);
    const righe = await prisma.eccezioneCalendario.findMany({ where: { tipo: "CHIUSURA", data: { gte: oggi } } });
    return righe.map((e: any) => ({
      startDate: e.data,
      endDate: e.data,
      reason: e.titolo || "Chiusura Programmata",
      isClosedAllDay: true,
    }));
  } catch {
    return [];
  }
}

/** Configurazione salvata (JSON) oppure null. */
export async function leggiConfigSalvata(): Promise<any | null> {
  try {
    const imp = await prisma.impostazioni.findUnique({ where: { id: "singleton" } });
    if (imp?.showcaseConfig && imp.showcaseConfig !== "{}") return JSON.parse(imp.showcaseConfig);
  } catch {}
  return null;
}

/**
 * Quando salva lo Studio, i dati dell'attività restano quelli salvati nelle Impostazioni,
 * qualunque cosa arrivi dal browser. Cambiano solo colori, logo, foto, testi di presentazione e interruttori.
 */
export function proteggiDatiAttivita(body: any, salvata: any | null): any {
  if (!salvata) return body;
  if (salvata.brand?.name !== undefined) body.brand = { ...(body.brand || {}), name: salvata.brand.name };
  if (salvata.business) body.business = { ...salvata.business };
  if (salvata.atelier) {
    body.atelier = { ...(body.atelier || {}) };
    for (const k of [
      "addressText",
      "hoursWeekdayText",
      "hoursSaturdayText",
      "hoursSundayText",
      "description",
      "whatsappButtonText",
    ]) {
      if (salvata.atelier[k] !== undefined) body.atelier[k] = salvata.atelier[k];
    }
  }
  return body;
}
