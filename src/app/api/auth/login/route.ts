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
  verifyTotpToken,
  verifyAndConsumeBackupCode,
  logAccessAndCheckNewDevice,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || null;

  try {
    const body = await req.json();
    const { email, password, honeypot, mfaToken, isBackupCode } = body;

    // 1. Verifica Honeypot (bot trap)
    if (honeypot && honeypot.trim() !== "") {
      console.warn(`[AntiBot] Trapped bot attempt from IP ${ip}`);
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 403 });
    }

    // 2. Controllo Rate Limit IP (Sliding Window 15 min)
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

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });
    }

    // 3. Controllo Account Lockout
    const accountCheck = await checkAccountLockout(email);
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

    // 4. Ricerca Utente nel DB
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let passwordValid = false;

    if (user) {
      passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid && isDemoEnvironment(req.headers.get("host"))) {
        passwordValid = verifyAdminPasswordOrPin(password);
      }
    } else {
      // In demo o primo avvio, supporta credenziali master se create
      if (isDemoEnvironment(req.headers.get("host")) && verifyAdminPasswordOrPin(password)) {
        passwordValid = true;
      }
    }

    if (!passwordValid) {
      recordFailedIpAttempt(ip);
      await recordFailedAccountAttempt(email);
      if (user) {
        await logAccessAndCheckNewDevice(user.id, "LOGIN_FAILED", ip, userAgent);
      }
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
    }

    // 5. Controllo MFA se abilitato per l'utente
    if (user && user.mfaEnabled && user.mfaSecret) {
      if (!mfaToken) {
        return NextResponse.json({ mfaRequired: true });
      }

      let mfaSuccess = false;
      if (isBackupCode) {
        const backupResult = verifyAndConsumeBackupCode(mfaToken, user.mfaBackupCodes);
        if (backupResult.valid) {
          mfaSuccess = true;
          await prisma.user.update({
            where: { id: user.id },
            data: { mfaBackupCodes: backupResult.updatedJson },
          });
        }
      } else {
        mfaSuccess = verifyTotpToken(user.mfaSecret, mfaToken);
      }

      if (!mfaSuccess) {
        recordFailedIpAttempt(ip);
        await logAccessAndCheckNewDevice(user.id, "MFA_FAILED", ip, userAgent);
        return NextResponse.json(
          { error: isBackupCode ? "Codice di emergenza non valido" : "Codice 2FA non valido" },
          { status: 401 }
        );
      }
    }

    // 6. Accesso Riuscito: reset contatori e log
    resetIpAttempts(ip);
    await resetAccountAttempts(email);

    if (user) {
      await logAccessAndCheckNewDevice(user.id, "LOGIN_SUCCESS", ip, userAgent);
    }

    // 7. Imposta sessione
    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Errore login:", err);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
