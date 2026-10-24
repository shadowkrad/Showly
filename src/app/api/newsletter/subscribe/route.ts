import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nome,
      email,
      telefono,
      sponsor,
      campagna,
      codiceReferral,
      consensoPrivacy = true,
    } = body;

    const trimmedEmail = email?.trim().toLowerCase() || null;
    const trimmedTelefono = telefono?.trim() || null;

    if (!trimmedEmail && !trimmedTelefono) {
      return NextResponse.json(
        { error: "Inserisci almeno un'email o un numero WhatsApp per iscriverti." },
        { status: 400 }
      );
    }

    if (!consensoPrivacy) {
      return NextResponse.json(
        { error: "È necessario accettare l'informativa sulla privacy per procedere." },
        { status: 400 }
      );
    }

    // Estrai IP se disponibile
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Verifica se esiste già un contatto con la stessa email o telefono
    let existing = null;
    if (trimmedEmail) {
      existing = await prisma.clienteNewsletter.findFirst({
        where: { email: trimmedEmail },
      });
    }
    if (!existing && trimmedTelefono) {
      existing = await prisma.clienteNewsletter.findFirst({
        where: { telefono: trimmedTelefono },
      });
    }

    if (existing) {
      // Aggiorna cliente esistente riattivandolo se era disiscritto
      const aggiornato = await prisma.clienteNewsletter.update({
        where: { id: existing.id },
        data: {
          nome: nome?.trim() || existing.nome,
          email: trimmedEmail || existing.email,
          telefono: trimmedTelefono || existing.telefono,
          // Mantieni lo sponsor originale ma aggiorna la campagna se nuova
          campagna: campagna?.trim() || existing.campagna,
          codiceReferral: codiceReferral?.trim() || existing.codiceReferral,
          stato: existing.stato === "DISISCRITTO" ? "ATTIVO" : existing.stato,
          ultimoContatto: new Date(),
        },
      });

      return NextResponse.json({
        ok: true,
        message: "Bentornato! I tuoi dati e preferenze sono stati aggiornati.",
        clienteId: aggiornato.id,
      });
    }

    // Nuovo cliente
    const nuovo = await prisma.clienteNewsletter.create({
      data: {
        nome: nome?.trim() || null,
        email: trimmedEmail,
        telefono: trimmedTelefono,
        sponsor: sponsor?.trim() || "Diretto (Sito Web)",
        campagna: campagna?.trim() || "Iscrizione Vetrina",
        codiceReferral: codiceReferral?.trim() || null,
        stato: "ATTIVO",
        consensoPrivacy: true,
        ipIscrizione: ip,
        ultimoContatto: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Iscrizione completata con successo! Benvenuto nel nostro cerchio esclusivo.",
      clienteId: nuovo.id,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    console.error("Errore iscrizione newsletter:", errorMsg);
    return NextResponse.json(
      { error: "Errore durante l'elaborazione dell'iscrizione." },
      { status: 500 }
    );
  }
}
