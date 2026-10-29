import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setAdminSession, verifyAdminPasswordOrPin, isDemoEnvironment } from "@/lib/auth";
import {
  getClientIp,
  checkIpRateLimit,
  recordFailedIpAttempt,
  resetIpAttempts,
  checkAccountLockout,
  recordFailedAccountAttempt,
  resetAccountAttempts,
  logAccessAndCheckNewDevice,
} from "@/lib/security";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    isDemo: isDemoEnvironment(req.headers.get("host")),
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const host = req.headers.get("host") || "";
  const userAgent = req.headers.get("user-agent") || null;

  try {
    const body = await req.json();
    const { email, password, pin, honeypot, demo } = body;

    // 0. Accesso Diretto 1-Click (SOLO ed esclusivamente per l'ambiente Demo Vercel / cliente-demo)
    if (demo === true) {
      if (!isDemoEnvironment(host)) {
        return NextResponse.json(
          { error: "Accesso rapido demo consentito solo sull'ambiente dimostrativo." },
          { status: 403 }
        );
      }
      await setAdminSession();
      return NextResponse.json({ success: true, demo: true });
    }

    // 1. Verifica Honeypot (bot trap)
    if (honeypot && honeypot.trim() !== "") {
      console.warn(`[AntiBot] Trapped bot attempt from IP ${ip}`);
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 403 });
    }

    // 2. Controllo Rate Limit IP
    const ipCheck = checkIpRateLimit(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        {
          error: `Troppi tentativi falliti da questo indirizzo. Riprova tra ${Math.ceil(
            (ipCheck.retryAfterSeconds || 900) / 60
          )} minuti.`,
        },
        { status: 429 }
      );
    }

    let authSuccess = false;
    let authRole = "ADMIN";
    let operatorName = "Titolare";

    // ── MODALITÀ A: TITOLARE CON EMAIL + PASSWORD ──
    if (email && password) {
      const cleanEmail = String(email).trim().toLowerCase();
      const rawPassword = String(password);

      // Controllo Account Lockout locale
      const accountCheck = await checkAccountLockout(cleanEmail);
      if (accountCheck.locked) {
        return NextResponse.json(
          {
            error: `Questo account è temporaneamente bloccato per sicurezza. Riprova tra ${Math.ceil(
              (accountCheck.retryAfterSeconds || 900) / 60
            )} minuti.`,
          },
          { status: 423 }
        );
      }

      // 1. Verifica centralizzata su Taaaac Core
      const coreApiUrl = process.env.TAAAAC_CORE_API_URL?.trim() || "https://taaaac.eu";
      const tenantDomain = process.env.TAAAAC_TENANT_DOMAIN || host;
      const subdomain = tenantDomain ? tenantDomain.split(".")[0].toLowerCase() : null;

      try {
        const coreRes = await fetch(`${coreApiUrl}/api/internal/auth/verify-tenant-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: rawPassword,
            subdomain,
          }),
        });

        if (coreRes.ok) {
          const coreData = await coreRes.json();
          if (coreData.valid) {
            authSuccess = true;
            authRole = coreData.user?.role || "ADMIN";
            operatorName = coreData.user?.name || cleanEmail;
          }
        }
      } catch (err) {
        console.warn("Verifica centralizzata Taaaac Core non disponibile, tento fallback locale:", err);
      }

      // 2. Fallback locale DB
      if (!authSuccess) {
        const localUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (localUser && (await bcrypt.compare(rawPassword, localUser.passwordHash))) {
          authSuccess = true;
          authRole = localUser.ruolo || "ADMIN";
          operatorName = localUser.nome || cleanEmail;
        } else if (verifyAdminPasswordOrPin(rawPassword)) {
          authSuccess = true;
          authRole = "ADMIN";
          operatorName = "Amministratore Showroom";
        }
      }

      if (!authSuccess) {
        recordFailedIpAttempt(ip);
        await recordFailedAccountAttempt(cleanEmail);
        return NextResponse.json(
          { error: "Email o password errati. Verifica le credenziali ricevute via email." },
          { status: 401 }
        );
      }

      await resetAccountAttempts(cleanEmail);
    }
    // ── MODALITÀ B: STAFF CON PIN RAPIDO ──
    else if (pin) {
      const cleanPin = String(pin).trim();
      const masterPin = process.env.ADMIN_PIN?.trim();

      if (masterPin && cleanPin === masterPin) {
        authSuccess = true;
        authRole = "STAFF";
        operatorName = "Staff Showroom";
      } else if (verifyAdminPasswordOrPin(cleanPin)) {
        authSuccess = true;
        authRole = "ADMIN";
        operatorName = "Postazione Showroom";
      } else {
        recordFailedIpAttempt(ip);
        return NextResponse.json(
          { error: "PIN non valido o non riconosciuto." },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Inserisci email e password per accedere." },
        { status: 400 }
      );
    }

    resetIpAttempts(ip);

    // Salva sessione utente
    await setAdminSession();

    // Rilevamento nuovo dispositivo
    try {
      await logAccessAndCheckNewDevice(email || "staff-pin", "LOGIN_SUCCESS", ip, userAgent);
    } catch (e) {
      console.error("[Login Log Error]", e);
    }

    return NextResponse.json({
      success: true,
      role: authRole,
      operator: operatorName,
    });
  } catch (error: any) {
    console.error("[Login API Error]", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
