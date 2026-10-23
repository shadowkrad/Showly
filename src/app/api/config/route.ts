import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SHOWLY_CONFIG } from "@/lib/config";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const impostazioni = await prisma.impostazioni.findUnique({
      where: { id: "singleton" },
    });

    if (impostazioni && impostazioni.showcaseConfig) {
      try {
        const parsed = JSON.parse(impostazioni.showcaseConfig);
        return NextResponse.json(parsed);
      } catch {
        // fallback
      }
    }
    return NextResponse.json(DEFAULT_SHOWLY_CONFIG);
  } catch (err: any) {
    return NextResponse.json(DEFAULT_SHOWLY_CONFIG);
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await prisma.impostazioni.upsert({
      where: { id: "singleton" },
      update: {
        showcaseConfig: JSON.stringify(body),
        mostraPrezzi: body.pricing?.showPricesGlobally ?? true,
      },
      create: {
        id: "singleton",
        nomeAttivita: body.brand?.name || "Atelier Aurora",
        showcaseConfig: JSON.stringify(body),
        mostraPrezzi: body.pricing?.showPricesGlobally ?? true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
