import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const impostazioni = await prisma.impostazioni.findUnique({
      where: { id: "singleton" },
    });

    if (impostazioni && impostazioni.showcaseConfig && impostazioni.showcaseConfig !== "{}") {
      try {
        const parsed = JSON.parse(impostazioni.showcaseConfig) as Partial<ShowlyConfig>;
        return NextResponse.json({
          ...DEFAULT_SHOWLY_CONFIG,
          ...parsed,
          brand: { ...DEFAULT_SHOWLY_CONFIG.brand, ...(parsed.brand || {}) },
          business: { ...DEFAULT_SHOWLY_CONFIG.business!, ...(parsed.business || {}) },
          pricing: { ...DEFAULT_SHOWLY_CONFIG.pricing, ...(parsed.pricing || {}) },
          navigation: { ...DEFAULT_SHOWLY_CONFIG.navigation, ...(parsed.navigation || {}) },
          hero: { ...DEFAULT_SHOWLY_CONFIG.hero, ...(parsed.hero || {}) },
          showgallery: { ...DEFAULT_SHOWLY_CONFIG.showgallery, ...(parsed.showgallery || {}) },
          catalog: { ...DEFAULT_SHOWLY_CONFIG.catalog, ...(parsed.catalog || {}) },
          atelier: { ...DEFAULT_SHOWLY_CONFIG.atelier, ...(parsed.atelier || {}) },
          reserveModal: { ...DEFAULT_SHOWLY_CONFIG.reserveModal, ...(parsed.reserveModal || {}) },
          footer: { ...DEFAULT_SHOWLY_CONFIG.footer, ...(parsed.footer || {}) },
        });
      } catch {
        // fallback
      }
    }
    return NextResponse.json(DEFAULT_SHOWLY_CONFIG);
  } catch {
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
        nomeAttivita: body.brand?.name || "Atelier Aurora",
        telefono: body.business?.telefono || "+39 0575 889211",
        indirizzo: body.atelier?.addressText || "Via del Corso 24, Arezzo",
        showcaseConfig: JSON.stringify(body),
        mostraPrezzi: body.pricing?.showPricesGlobally ?? true,
      },
      create: {
        id: "singleton",
        nomeAttivita: body.brand?.name || "Atelier Aurora",
        telefono: body.business?.telefono || "+39 0575 889211",
        indirizzo: body.atelier?.addressText || "Via del Corso 24, Arezzo",
        showcaseConfig: JSON.stringify(body),
        mostraPrezzi: body.pricing?.showPricesGlobally ?? true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
