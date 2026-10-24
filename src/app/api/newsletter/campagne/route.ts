import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const campagne = await prisma.campagnaNewsletter.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campagne });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    console.error("Errore recupero campagne:", errorMsg);
    return NextResponse.json(
      { error: "Errore durante il recupero delle campagne." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      titolo,
      oggettoEmail,
      messaggio,
      sponsorCorrelato,
      canale = "EMAIL",
      destinatariFiltro = "TUTTI",
      inviaSubito = true,
    } = body;

    if (!titolo?.trim() || !messaggio?.trim()) {
      return NextResponse.json(
        { error: "Titolo e messaggio sono obbligatori." },
        { status: 400 }
      );
    }

    // Calcola il numero di destinatari in base al filtro
    const whereClause: Record<string, unknown> = {
      stato: { not: "DISISCRITTO" },
    };

    if (destinatariFiltro === "SOLO_VIP") {
      whereClause.stato = "VIP";
    } else if (destinatariFiltro === "PER_SPONSOR" && sponsorCorrelato) {
      whereClause.sponsor = sponsorCorrelato;
    }

    const clientiDestinatari = await prisma.clienteNewsletter.findMany({
      where: whereClause,
    });

    const numeroDestinatari = clientiDestinatari.length;

    const campagna = await prisma.campagnaNewsletter.create({
      data: {
        titolo: titolo.trim(),
        oggettoEmail: oggettoEmail?.trim() || titolo.trim(),
        messaggio: messaggio.trim(),
        sponsorCorrelato: sponsorCorrelato?.trim() || null,
        canale,
        destinatariFiltro,
        numeroDestinatari,
        stato: inviaSubito ? "INVIATA" : "BOZZA",
        dataInviato: inviaSubito ? new Date() : null,
      },
    });

    // Aggiorna data ultimo contatto dei clienti destinatari
    if (inviaSubito && clientiDestinatari.length > 0) {
      const ids = clientiDestinatari.map((c) => c.id);
      await prisma.clienteNewsletter.updateMany({
        where: { id: { in: ids } },
        data: { ultimoContatto: new Date() },
      });
    }

    return NextResponse.json({ ok: true, campagna });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    console.error("Errore salvataggio campagna:", errorMsg);
    return NextResponse.json(
      { error: "Errore durante il salvataggio della campagna." },
      { status: 500 }
    );
  }
}
