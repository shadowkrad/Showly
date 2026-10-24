import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const sponsorFilter = searchParams.get("sponsor")?.trim() || "";
    const statoFilter = searchParams.get("stato")?.trim() || "";

    const whereClause: Record<string, unknown> = {};

    if (sponsorFilter && sponsorFilter !== "TUTTI") {
      whereClause.sponsor = sponsorFilter;
    }

    if (statoFilter && statoFilter !== "TUTTI") {
      whereClause.stato = statoFilter;
    }

    let clienti = await prisma.clienteNewsletter.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (search) {
      clienti = clienti.filter(
        (c) =>
          (c.nome && c.nome.toLowerCase().includes(search)) ||
          (c.email && c.email.toLowerCase().includes(search)) ||
          (c.telefono && c.telefono.toLowerCase().includes(search)) ||
          (c.sponsor && c.sponsor.toLowerCase().includes(search)) ||
          (c.campagna && c.campagna.toLowerCase().includes(search))
      );
    }

    // Calcolo KPI & Statistiche Sponsorizzazioni
    const tuttiIClienti = await prisma.clienteNewsletter.findMany();

    const totale = tuttiIClienti.length;
    const attivi = tuttiIClienti.filter((c) => c.stato === "ATTIVO").length;
    const vip = tuttiIClienti.filter((c) => c.stato === "VIP").length;
    const lead = tuttiIClienti.filter((c) => c.stato === "LEAD").length;

    // Raggruppamento per Sponsor
    const sponsorMap: Record<
      string,
      { count: number; vipCount: number; leadCount: number }
    > = {};

    tuttiIClienti.forEach((c) => {
      const sp = c.sponsor || "Diretto";
      if (!sponsorMap[sp]) {
        sponsorMap[sp] = { count: 0, vipCount: 0, leadCount: 0 };
      }
      sponsorMap[sp].count += 1;
      if (c.stato === "VIP") sponsorMap[sp].vipCount += 1;
      if (c.stato === "LEAD") sponsorMap[sp].leadCount += 1;
    });

    const sponsorBreakdown = Object.entries(sponsorMap)
      .map(([sponsor, stats]) => ({
        sponsor,
        count: stats.count,
        vipCount: stats.vipCount,
        leadCount: stats.leadCount,
        percentuale: totale > 0 ? Math.round((stats.count / totale) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      clienti,
      statistiche: {
        totale,
        attivi,
        vip,
        lead,
        sponsorBreakdown,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    console.error("Errore recupero clienti newsletter:", errorMsg);
    return NextResponse.json(
      { error: "Errore durante il recupero dei clienti." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, telefono, sponsor, campagna, codiceReferral, stato, note } =
      body;

    const trimmedEmail = email?.trim().toLowerCase() || null;
    const trimmedTelefono = telefono?.trim() || null;

    if (!trimmedEmail && !trimmedTelefono && !nome) {
      return NextResponse.json(
        { error: "Inserisci almeno un nome, email o telefono." },
        { status: 400 }
      );
    }

    const cliente = await prisma.clienteNewsletter.create({
      data: {
        nome: nome?.trim() || null,
        email: trimmedEmail,
        telefono: trimmedTelefono,
        sponsor: sponsor?.trim() || "Diretto",
        campagna: campagna?.trim() || null,
        codiceReferral: codiceReferral?.trim() || null,
        stato: stato || "ATTIVO",
        note: note?.trim() || null,
        consensoPrivacy: true,
        ultimoContatto: new Date(),
      },
    });

    return NextResponse.json({ ok: true, cliente });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    console.error("Errore creazione cliente:", errorMsg);
    return NextResponse.json(
      { error: "Errore durante la creazione del contatto." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nome, email, telefono, sponsor, campagna, stato, note } = body;

    if (!id) {
      return NextResponse.json({ error: "ID cliente mancante." }, { status: 400 });
    }

    const aggiornato = await prisma.clienteNewsletter.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome: nome?.trim() || null }),
        ...(email !== undefined && {
          email: email?.trim().toLowerCase() || null,
        }),
        ...(telefono !== undefined && { telefono: telefono?.trim() || null }),
        ...(sponsor !== undefined && { sponsor: sponsor?.trim() || "Diretto" }),
        ...(campagna !== undefined && { campagna: campagna?.trim() || null }),
        ...(stato !== undefined && { stato }),
        ...(note !== undefined && { note: note?.trim() || null }),
        ultimoContatto: new Date(),
      },
    });

    return NextResponse.json({ ok: true, cliente: aggiornato });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    console.error("Errore aggiornamento cliente:", errorMsg);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del contatto." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID cliente mancante." }, { status: 400 });
    }

    await prisma.clienteNewsletter.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    console.error("Errore eliminazione cliente:", errorMsg);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione del contatto." },
      { status: 500 }
    );
  }
}
