import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const impostazioni = await prisma.impostazioni.findUnique({
      where: { id: "singleton" },
    });

    let fidelityRules = null;
    try {
      if (impostazioni?.fidelityRules) {
        fidelityRules = JSON.parse(impostazioni.fidelityRules);
      }
    } catch {
      fidelityRules = null;
    }

    const baseResult = {
      ...DEFAULT_SHOWLY_CONFIG,
      telegramSettings: {
        enabled: Boolean(impostazioni?.telegramEnabled),
        botToken: impostazioni?.telegramBotToken || "",
        botUsername: impostazioni?.telegramBotUsername || "",
        staffChatId: impostazioni?.telegramStaffChatId || "",
      },
      fidelitySettings: {
        enabled: Boolean(impostazioni?.fidelityEnabled),
        pointsPerEuro: fidelityRules?.pointsPerEuro || 1,
        welcomeBonusPoints: fidelityRules?.welcomeBonusPoints || 15,
        minPointsToRedeem: fidelityRules?.minPointsToRedeem || 60,
        rewards: fidelityRules?.rewards || [
          { id: "rew_s1", name: "Consulenza d'Immagine & Prova Privata Atelier", pointsRequired: 60, rewardType: "FREE_ITEM", freeItemName: "Sessione privata in showroom con calice di benvenuto" },
          { id: "rew_s2", name: "Sconto 25€ su Creazione d'Autore", pointsRequired: 140, rewardType: "DISCOUNT", discountAmount: 25 },
          { id: "rew_s3", name: "Invito Esclusivo VIP Preview Nuova Collezione", pointsRequired: 250, rewardType: "FREE_ITEM", freeItemName: "Pass VIP con posto riservato alla sfilata/preview" },
        ],
      },
    };

    if (impostazioni && impostazioni.showcaseConfig && impostazioni.showcaseConfig !== "{}") {
      try {
        const parsed = JSON.parse(impostazioni.showcaseConfig) as Partial<ShowlyConfig>;
        return NextResponse.json({
          ...baseResult,
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
          telegramSettings: baseResult.telegramSettings,
          fidelitySettings: baseResult.fidelitySettings,
        });
      } catch {
        // fallback
      }
    }
    return NextResponse.json(baseResult);
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
    const { telegramSettings, fidelitySettings, ...restConfig } = body;

    await prisma.impostazioni.upsert({
      where: { id: "singleton" },
      update: {
        nomeAttivita: restConfig.brand?.name || "Atelier Aurora",
        telefono: restConfig.business?.telefono || "+39 0575 889211",
        indirizzo: restConfig.atelier?.addressText || "Via del Corso 24, Arezzo",
        showcaseConfig: JSON.stringify(restConfig),
        mostraPrezzi: restConfig.pricing?.showPricesGlobally ?? true,
        ...(telegramSettings?.enabled !== undefined && { telegramEnabled: Boolean(telegramSettings.enabled) }),
        ...(telegramSettings?.botToken !== undefined && { telegramBotToken: telegramSettings.botToken }),
        ...(telegramSettings?.botUsername !== undefined && { telegramBotUsername: telegramSettings.botUsername }),
        ...(telegramSettings?.staffChatId !== undefined && { telegramStaffChatId: telegramSettings.staffChatId }),
        ...(fidelitySettings?.enabled !== undefined && { fidelityEnabled: Boolean(fidelitySettings.enabled) }),
        ...(fidelitySettings !== undefined && { fidelityRules: JSON.stringify(fidelitySettings) }),
      },
      create: {
        id: "singleton",
        nomeAttivita: restConfig.brand?.name || "Atelier Aurora",
        telefono: restConfig.business?.telefono || "+39 0575 889211",
        indirizzo: restConfig.atelier?.addressText || "Via del Corso 24, Arezzo",
        showcaseConfig: JSON.stringify(restConfig),
        mostraPrezzi: restConfig.pricing?.showPricesGlobally ?? true,
        telegramEnabled: Boolean(telegramSettings?.enabled),
        telegramBotToken: telegramSettings?.botToken || null,
        telegramBotUsername: telegramSettings?.botUsername || null,
        telegramStaffChatId: telegramSettings?.staffChatId || null,
        fidelityEnabled: Boolean(fidelitySettings?.enabled),
        fidelityRules: fidelitySettings ? JSON.stringify(fidelitySettings) : "{}",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
