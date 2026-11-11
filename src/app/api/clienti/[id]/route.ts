import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { normalizePhone, parseDataNascita } from "@/lib/phone";
import { cercaClientePerTelefono } from "@/lib/clienti-telefono";
import { assicuraTokenTessera } from "@/lib/fidelity";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  await ensureDatabase();
  const { id } = await params;

  const cliente = await prisma.clienteNewsletter.findUnique({
    where: { id },
    include: {
      pointsMovements: { orderBy: { createdAt: "desc" }, take: 15 },
    },
  });
  if (!cliente) {
    return NextResponse.json({ error: "Cliente non trovato" }, { status: 404 });
  }

  const tokenTessera = await assicuraTokenTessera(id);
  const ora = new Date();
  const digits = (cliente.telefono || "").replace(/\D/g, "");
  const suffix = digits.length >= 6 ? digits.slice(-8) : "";

  const [buoni, prenotazioni, imp] = await Promise.all([
    prisma.giftCard.findMany({
      where: {
        clienteId: id,
        stato: "ATTIVA",
        OR: [{ dataScadenza: null }, { dataScadenza: { gte: ora } }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        codice: true,
        motivo: true,
        tipoValore: true,
        importoIniziale: true,
        saldoResiduo: true,
        percentuale: true,
        descrizioneServizio: true,
        dataScadenza: true,
      },
    }),
    suffix
      ? prisma.prenotazioneCamerino.findMany({
          where: { whatsapp: { contains: suffix } },
          orderBy: { createdAt: "desc" },
          take: 25,
        })
      : Promise.resolve([]),
    prisma.impostazioni
      .findUnique({ where: { id: "singleton" }, select: { nomeAttivita: true } })
      .catch(() => null),
  ]);

  return NextResponse.json({
    cliente: {
      ...cliente,
      tokenTessera,
    },
    buoni,
    prenotazioni: prenotazioni.map((p) => ({
      id: p.id,
      titoloPezzo: p.titoloPezzo,
      specifica: p.specifica,
      prezzo: p.prezzo,
      stato: p.stato,
      createdAt: p.createdAt.toISOString(),
    })),
    nomeAttivita: imp?.nomeAttivita || "Atelier Aurora",
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  await ensureDatabase();
  const { id } = await params;
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  let telefono: string | null | undefined;
  if (b.telefono !== undefined) {
    const t = String(b.telefono || "").trim();
    if (t) {
      const altro = await cercaClientePerTelefono(t, id);
      if (altro) {
        return NextResponse.json(
          {
            error: `Questo numero è già registrato per ${altro.nome || "un altro cliente"}`,
            clienteEsistenteId: altro.id,
          },
          { status: 409 }
        );
      }
      telefono = normalizePhone(t) || t;
    } else {
      telefono = null;
    }
  }

  let nascita: Date | null | undefined;
  if (b.dataNascita !== undefined) {
    if (b.dataNascita) {
      nascita = parseDataNascita(String(b.dataNascita));
      if (!nascita) return NextResponse.json({ error: "Data di nascita non valida" }, { status: 400 });
    } else {
      nascita = null;
    }
  }

  const cliente = await prisma.clienteNewsletter.update({
    where: { id },
    data: {
      ...(b.nome !== undefined ? { nome: String(b.nome || "").trim() || null } : {}),
      ...(telefono !== undefined ? { telefono } : {}),
      ...(b.email !== undefined ? { email: String(b.email || "").trim().toLowerCase() || null } : {}),
      ...(b.sponsor !== undefined ? { sponsor: String(b.sponsor || "").trim() || "Diretto" } : {}),
      ...(b.campagna !== undefined ? { campagna: String(b.campagna || "").trim() || null } : {}),
      ...(b.stato !== undefined ? { stato: String(b.stato) } : {}),
      ...(b.note !== undefined ? { note: String(b.note || "").trim() || null } : {}),
      ...(nascita !== undefined ? { dataNascita: nascita } : {}),
      ...(b.consensoPrivacy !== undefined ? { consensoPrivacy: Boolean(b.consensoPrivacy) } : {}),
    },
  });

  return NextResponse.json({ cliente });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  await ensureDatabase();
  const { id } = await params;

  await prisma.clienteNewsletter.update({
    where: { id },
    data: {
      nome: "Cliente Anonimizzato",
      telefono: "CANCELLATO",
      email: null,
      note: null,
      dataNascita: null,
      consensoPrivacy: false,
      stato: "DISISCRITTO",
      loyaltyPoints: 0,
      loyaltyToken: null,
    },
  });

  return NextResponse.json({ success: true });
}
