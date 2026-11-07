import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

/** Ricerca rapida clienti (nome, email o telefono) per intestare un buono. */
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const ricerca = req.nextUrl.searchParams.get("ricerca")?.trim() || "";
  const limit = Math.min(20, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "8", 10) || 8));
  const cifre = ricerca.replace(/\D/g, "");

  const righe = await prisma.clienteNewsletter.findMany({
    where: {
      NOT: { stato: "DISISCRITTO" },
      ...(ricerca
        ? { OR: [{ nome: { contains: ricerca } }, { email: { contains: ricerca } }, ...(cifre.length >= 3 ? [{ telefono: { contains: cifre } }] : [])] }
        : {}),
    },
    select: { id: true, nome: true, telefono: true, email: true },
    orderBy: { nome: "asc" },
    take: limit,
  });

  return NextResponse.json({
    clienti: righe.map((c) => ({ id: c.id, nome: c.nome || "(senza nome)", cognome: "", telefono: c.telefono || "", email: c.email })),
  });
}
