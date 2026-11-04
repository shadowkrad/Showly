import { NextResponse } from "next/server";
import { fetchTenantConfig } from "@/lib/taaaac-client";

export const dynamic = "force-dynamic";

/**
 * Stato Telegram del tenant, letto da Taaaac Core (mai token né chat ID).
 */
export async function GET() {
  try {
    const cfg = await fetchTenantConfig();
    return NextResponse.json({
      managedByCore: true,
      enabled: Boolean(cfg.telegramEnabled),
      botUsername: cfg.telegramBotUsername || "",
      staffAlerts: cfg.telegramAutoConfirm !== false,
      reminder24h: cfg.telegramAutoReminder24h !== false,
    });
  } catch {
    return NextResponse.json({ managedByCore: true, enabled: false, botUsername: "", staffAlerts: true, reminder24h: true });
  }
}
