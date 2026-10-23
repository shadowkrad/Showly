import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const list = await prisma.prenotazioneCamerino.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nomeCliente, whatsapp, titoloPezzo, specifica, note } = body;

    if (!nomeCliente || !whatsapp || !titoloPezzo) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 }
      );
    }

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const prenotazione = await prisma.prenotazioneCamerino.create({
      data: {
        nomeCliente: nomeCliente.trim(),
        whatsapp: whatsapp.trim(),
        titoloPezzo: titoloPezzo.trim(),
        specifica: specifica?.trim() || null,
        note: note?.trim() || null,
        stato: "IN_ATTESA",
        dataScadenza: in24h,
      },
    });

    return NextResponse.json({ success: true, prenotazione });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, stato } = body;

    if (!id || !stato) {
      return NextResponse.json({ error: "ID o stato mancante" }, { status: 400 });
    }

    const updated = await prisma.prenotazioneCamerino.update({
      where: { id },
      data: { stato },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
