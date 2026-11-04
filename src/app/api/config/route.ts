import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  let whatsappEnabled = true;
  let coreWhatsappPhone: string | undefined;

  const coreUrl = process.env.TAAAAC_CORE_URL || "https://taaaac.eu";
  const domain =
    process.env.TAAAAC_TENANT_DOMAIN ||
    process.env.TAAAAC_DOMAIN ||
    "showly-demo.taaaac.eu";
  const token =
    process.env.TAAAAC_TENANT_TOKEN ||
    process.env.TAAAAC_TOKEN ||
    "demo-token-showly";

  const isDemo =
    process.env.NODE_ENV === "development" ||
    domain.includes("demo") ||
    domain.includes("localhost") ||
    domain.includes("vercel.app");

  if (!isDemo) {
    try {
      const endpoint = `${coreUrl}/api/public/tenant-config?domain=${encodeURIComponent(
        domain
      )}&token=${encodeURIComponent(token)}`;
      const res = await fetch(endpoint, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        const tenantNode = data?.tenant || {};
        const rawModules: string[] = Array.isArray(data?.enabledModules)
          ? data.enabledModules
          : Array.isArray(tenantNode?.moduliAttivi)
          ? tenantNode.moduliAttivi
          : [];
        whatsappEnabled =
          Boolean(tenantNode?.whatsappEnabled) ||
          rawModules.some((m) => String(m).toUpperCase().includes("WHATSAPP"));
        coreWhatsappPhone =
          tenantNode?.whatsappDisplayNumber ||
          data?.contact?.phone ||
          data?.phone ||
          undefined;
      }
    } catch {}
  }

  try {
    const impostazioni = await prisma.impostazioni.findUnique({
      where: { id: "singleton" },
    });

    if (impostazioni && impostazioni.showcaseConfig && impostazioni.showcaseConfig !== "{}") {
      try {
        const parsed = JSON.parse(impostazioni.showcaseConfig) as Partial<ShowlyConfig>;
        const resolvedAtelier = {
          ...DEFAULT_SHOWLY_CONFIG.atelier,
          ...(parsed.atelier || {}),
        };
        if (
          (!resolvedAtelier.whatsappButtonText ||
            resolvedAtelier.whatsappButtonText.trim() === "") &&
          (impostazioni.telefono || coreWhatsappPhone)
        ) {
          resolvedAtelier.whatsappButtonText =
            impostazioni.telefono ||
            coreWhatsappPhone ||
            DEFAULT_SHOWLY_CONFIG.atelier.whatsappButtonText;
        }
        return NextResponse.json({
          ...DEFAULT_SHOWLY_CONFIG,
          ...parsed,
          whatsappEnabled,
          brand: { ...DEFAULT_SHOWLY_CONFIG.brand, ...(parsed.brand || {}) },
          business: { ...DEFAULT_SHOWLY_CONFIG.business!, ...(parsed.business || {}) },
          pricing: { ...DEFAULT_SHOWLY_CONFIG.pricing, ...(parsed.pricing || {}) },
          navigation: { ...DEFAULT_SHOWLY_CONFIG.navigation, ...(parsed.navigation || {}) },
          hero: { ...DEFAULT_SHOWLY_CONFIG.hero, ...(parsed.hero || {}) },
          showgallery: { ...DEFAULT_SHOWLY_CONFIG.showgallery, ...(parsed.showgallery || {}) },
          catalog: { ...DEFAULT_SHOWLY_CONFIG.catalog, ...(parsed.catalog || {}) },
          atelier: resolvedAtelier,
          reserveModal: { ...DEFAULT_SHOWLY_CONFIG.reserveModal, ...(parsed.reserveModal || {}) },
          footer: { ...DEFAULT_SHOWLY_CONFIG.footer, ...(parsed.footer || {}) },
        });
      } catch {
        // fallback
      }
    }
    return NextResponse.json({
      ...DEFAULT_SHOWLY_CONFIG,
      whatsappEnabled,
      atelier: {
        ...DEFAULT_SHOWLY_CONFIG.atelier,
        whatsappButtonText:
          impostazioni?.telefono ||
          coreWhatsappPhone ||
          DEFAULT_SHOWLY_CONFIG.atelier.whatsappButtonText,
      },
    });
  } catch {
    return NextResponse.json({
      ...DEFAULT_SHOWLY_CONFIG,
      whatsappEnabled,
    });
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
