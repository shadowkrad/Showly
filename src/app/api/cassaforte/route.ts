import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loadArticoli, ArticoloDTO } from "@/app/api/catalogo/route";
import { DEFAULT_SHOWLY_CONFIG } from "@/lib/config";

export interface InvitoCassaforteDTO {
  id: string;
  token: string;
  nomeDestinatario: string;
  whatsappDestinatario: string;
  pinAccesso: string;
  notaRiservata: string;
  articoliIds: string[];
  mostraPrezzi: boolean;
  vincolaDispositivo: boolean;
  deviceFingerprint: string | null;
  maxAperture: number;
  apertureEffettuate: number;
  ultimoAccesso: string | null;
  scadenza: string;
  attivo: boolean;
  createdAt: string;
}

const globalForVault = globalThis as unknown as {
  memoryVaultInvites?: InvitoCassaforteDTO[];
};

function getInitialSeedInvites(): InvitoCassaforteDTO[] {
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "inv-demo-1",
      token: "VIP-AURORA-2026",
      nomeDestinatario: "Sig.ra Elena Conti",
      whatsappDestinatario: "+39 340 8899112",
      pinAccesso: "2026",
      notaRiservata:
        "Gentile Sig.ra Elena, abbiamo selezionato per Lei questi pezzi unici custoditi nel nostro caveau riservato. Può richiedere la visione privata in salotto con un semplice click.",
      articoliIds: ["vault-1", "vault-2", "cat-4"],
      mostraPrezzi: true,
      vincolaDispositivo: true,
      deviceFingerprint: null,
      maxAperture: 10,
      apertureEffettuate: 1,
      ultimoAccesso: new Date().toISOString(),
      scadenza: in7Days,
      attivo: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

async function loadInviti(): Promise<InvitoCassaforteDTO[]> {
  try {
    const rows = await prisma.invitoCassaforte.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (rows.length === 0) {
      const seed = getInitialSeedInvites();
      try {
        for (const inv of seed) {
          await prisma.invitoCassaforte.create({
            data: {
              id: inv.id,
              token: inv.token,
              nomeDestinatario: inv.nomeDestinatario,
              whatsappDestinatario: inv.whatsappDestinatario,
              pinAccesso: inv.pinAccesso,
              notaRiservata: inv.notaRiservata,
              articoliIds: JSON.stringify(inv.articoliIds),
              mostraPrezzi: inv.mostraPrezzi,
              vincolaDispositivo: inv.vincolaDispositivo,
              deviceFingerprint: inv.deviceFingerprint,
              maxAperture: inv.maxAperture,
              apertureEffettuate: inv.apertureEffettuate,
              ultimoAccesso: inv.ultimoAccesso ? new Date(inv.ultimoAccesso) : null,
              scadenza: new Date(inv.scadenza),
              attivo: inv.attivo,
            },
          });
        }
      } catch {
        // Fallback read-only
      }
      globalForVault.memoryVaultInvites = seed;
      return seed;
    }

    const mapped: InvitoCassaforteDTO[] = rows.map((r) => {
      let ids: string[] = [];
      try {
        ids = JSON.parse(r.articoliIds || "[]");
      } catch {
        ids = [];
      }
      return {
        id: r.id,
        token: r.token,
        nomeDestinatario: r.nomeDestinatario,
        whatsappDestinatario: r.whatsappDestinatario || "",
        pinAccesso: r.pinAccesso || "",
        notaRiservata: r.notaRiservata || "",
        articoliIds: ids,
        mostraPrezzi: r.mostraPrezzi,
        vincolaDispositivo: r.vincolaDispositivo,
        deviceFingerprint: r.deviceFingerprint || null,
        maxAperture: r.maxAperture,
        apertureEffettuate: r.apertureEffettuate,
        ultimoAccesso: r.ultimoAccesso ? r.ultimoAccesso.toISOString() : null,
        scadenza: r.scadenza.toISOString(),
        attivo: r.attivo,
        createdAt: r.createdAt.toISOString(),
      };
    });

    globalForVault.memoryVaultInvites = mapped;
    return mapped;
  } catch {
    if (!globalForVault.memoryVaultInvites) {
      globalForVault.memoryVaultInvites = getInitialSeedInvites();
    }
    return globalForVault.memoryVaultInvites;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const pin = searchParams.get("pin") || "";
  const clientFp = searchParams.get("fp") || req.headers.get("user-agent") || "default-fp";

  const [inviti, articoli] = await Promise.all([loadInviti(), loadArticoli()]);

  // Caso 1: Accesso pubblico del cliente tramite link /cassaforte/[token]
  if (token) {
    const invito = inviti.find(
      (i) => i.token.toUpperCase() === token.trim().toUpperCase()
    );

    if (!invito) {
      return NextResponse.json(
        { error: "Invito Cassaforte non trovato o non valido.", status: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!invito.attivo) {
      return NextResponse.json(
        {
          error: "Questo catalogo riservato è stato chiuso o revocato dall'Atelier.",
          status: "REVOKED",
          nomeDestinatario: invito.nomeDestinatario,
        },
        { status: 403 }
      );
    }

    if (new Date(invito.scadenza).getTime() < Date.now()) {
      return NextResponse.json(
        {
          error: "Il tempo di validità di questo invito riservato è scaduto.",
          status: "EXPIRED",
          nomeDestinatario: invito.nomeDestinatario,
        },
        { status: 403 }
      );
    }

    if (invito.maxAperture > 0 && invito.apertureEffettuate >= invito.maxAperture) {
      return NextResponse.json(
        {
          error: "È stato raggiunto il limite massimo di aperture consentite per questo link riservato.",
          status: "MAX_VIEWS_REACHED",
          nomeDestinatario: invito.nomeDestinatario,
        },
        { status: 403 }
      );
    }

    // Verifica PIN se impostato
    if (invito.pinAccesso && invito.pinAccesso.trim() !== "") {
      if (!pin) {
        return NextResponse.json({
          requiresPin: true,
          nomeDestinatario: invito.nomeDestinatario,
          scadenza: invito.scadenza,
          brandName: DEFAULT_SHOWLY_CONFIG.brand.name,
        });
      }
      if (pin.trim() !== invito.pinAccesso.trim()) {
        return NextResponse.json(
          {
            error: "Codice PIN non corretto. Verifica il codice ricevuto dall'Atelier.",
            requiresPin: true,
            nomeDestinatario: invito.nomeDestinatario,
          },
          { status: 401 }
        );
      }
    }

    // Verifica vincolo dispositivo (Anti-inoltro a terzi, escluso il token demo VIP-AURORA-2026)
    if (
      invito.vincolaDispositivo &&
      invito.token.toUpperCase() !== "VIP-AURORA-2026"
    ) {
      if (invito.deviceFingerprint && invito.deviceFingerprint !== clientFp) {
        return NextResponse.json(
          {
            error:
              "Questo catalogo privato è strettamente personale ed è già stato vincolato al dispositivo del destinatario originale.",
            status: "DEVICE_LOCKED",
            nomeDestinatario: invito.nomeDestinatario,
          },
          { status: 403 }
        );
      }
    }

    // Registra l'apertura e il fingerprint
    const updatedCount = invito.apertureEffettuate + 1;
    const nowIso = new Date().toISOString();
    const newFp = invito.deviceFingerprint || clientFp;

    invito.apertureEffettuate = updatedCount;
    invito.ultimoAccesso = nowIso;
    invito.deviceFingerprint = newFp;

    try {
      await prisma.invitoCassaforte.update({
        where: { id: invito.id },
        data: {
          apertureEffettuate: updatedCount,
          ultimoAccesso: new Date(nowIso),
          deviceFingerprint: newFp,
        },
      });
    } catch {
      // Fallback in-memory
    }

    // Filtra gli articoli dedicati a questa Cassaforte
    let articoliDedicati: ArticoloDTO[] = [];
    if (invito.articoliIds && invito.articoliIds.length > 0) {
      articoliDedicati = articoli.filter((a) => invito.articoliIds.includes(a.id));
    } else {
      articoliDedicati = articoli.filter((a) => a.visibilita === "CASSAFORTE");
    }

    return NextResponse.json({
      requiresPin: false,
      invito: {
        token: invito.token,
        nomeDestinatario: invito.nomeDestinatario,
        notaRiservata: invito.notaRiservata,
        mostraPrezzi: invito.mostraPrezzi,
        scadenza: invito.scadenza,
        apertureEffettuate: invito.apertureEffettuate,
        maxAperture: invito.maxAperture,
      },
      articoli: articoliDedicati,
      brand: DEFAULT_SHOWLY_CONFIG.brand,
      atelier: DEFAULT_SHOWLY_CONFIG.atelier,
    });
  }

  // Caso 2: Lista amministrativa completa per /dashboard/cassaforte
  return NextResponse.json({ inviti, articoli });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inviti = await loadInviti();

    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const token = (body.token || `VIP-${randomCode}`).toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const hours = Number(body.durataOre || 48);
    const scadenza = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    const nuovo: InvitoCassaforteDTO = {
      id: `inv-${Date.now()}`,
      token,
      nomeDestinatario: body.nomeDestinatario || "Cliente Riservato",
      whatsappDestinatario: body.whatsappDestinatario || "",
      pinAccesso: body.pinAccesso || "",
      notaRiservata:
        body.notaRiservata ||
        "Abbiamo selezionato per Lei queste creazioni esclusive in anteprima riservata.",
      articoliIds: Array.isArray(body.articoliIds) ? body.articoliIds : [],
      mostraPrezzi: body.mostraPrezzi ?? true,
      vincolaDispositivo: body.vincolaDispositivo ?? true,
      deviceFingerprint: null,
      maxAperture: Number(body.maxAperture ?? 10),
      apertureEffettuate: 0,
      ultimoAccesso: null,
      scadenza,
      attivo: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await prisma.invitoCassaforte.create({
        data: {
          id: nuovo.id,
          token: nuovo.token,
          nomeDestinatario: nuovo.nomeDestinatario,
          whatsappDestinatario: nuovo.whatsappDestinatario,
          pinAccesso: nuovo.pinAccesso,
          notaRiservata: nuovo.notaRiservata,
          articoliIds: JSON.stringify(nuovo.articoliIds),
          mostraPrezzi: nuovo.mostraPrezzi,
          vincolaDispositivo: nuovo.vincolaDispositivo,
          maxAperture: nuovo.maxAperture,
          scadenza: new Date(nuovo.scadenza),
          attivo: true,
        },
      });
    } catch {
      // Fallback in-memory
    }

    const updated = [nuovo, ...inviti];
    globalForVault.memoryVaultInvites = updated;

    return NextResponse.json({ success: true, invito: nuovo, inviti: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const inviti = await loadInviti();
    const target = inviti.find((i) => i.id === body.id);
    if (!target) {
      return NextResponse.json({ error: "Invito non trovato" }, { status: 404 });
    }

    if (typeof body.attivo === "boolean") target.attivo = body.attivo;
    if (body.resetDevice) target.deviceFingerprint = null;
    if (body.resetViews) target.apertureEffettuate = 0;

    try {
      await prisma.invitoCassaforte.update({
        where: { id: target.id },
        data: {
          attivo: target.attivo,
          deviceFingerprint: target.deviceFingerprint,
          apertureEffettuate: target.apertureEffettuate,
        },
      });
    } catch {
      // Fallback in-memory
    }

    globalForVault.memoryVaultInvites = inviti;
    return NextResponse.json({ success: true, inviti });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

    try {
      await prisma.invitoCassaforte.delete({ where: { id } });
    } catch {
      // Fallback in-memory
    }

    const inviti = await loadInviti();
    const filtered = inviti.filter((i) => i.id !== id);
    globalForVault.memoryVaultInvites = filtered;

    return NextResponse.json({ success: true, inviti: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
