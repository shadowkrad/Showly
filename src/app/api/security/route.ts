import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  generateBase32Secret,
  generateTotpUri,
  generateEmergencyBackupCodes,
  hashBackupCode,
  verifyTotpToken,
} from "@/lib/security";

export async function GET(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      include: {
        trustedDevices: { orderBy: { lastUsedAt: "desc" }, take: 10 },
        accessLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!user) {
      return NextResponse.json({ mfaEnabled: false, devices: [], logs: [] });
    }

    return NextResponse.json({
      mfaEnabled: user.mfaEnabled,
      devices: user.trustedDevices,
      logs: user.accessLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action");

  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    if (action === "setup-mfa") {
      const secret = generateBase32Secret();
      const otpUri = generateTotpUri(secret, user.email, "Taaaac Showly");
      const qrCode = await QRCode.toDataURL(otpUri);

      const rawBackupCodes = generateEmergencyBackupCodes(8);
      const hashedBackupCodes = rawBackupCodes.map(hashBackupCode);

      // Salva temporaneamente il secret e i codici hash
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaSecret: secret,
          mfaBackupCodes: JSON.stringify(hashedBackupCodes),
        },
      });

      return NextResponse.json({
        secret,
        qrCode,
        backupCodes: rawBackupCodes,
      });
    }

    if (action === "confirm-mfa") {
      const { token } = await req.json();
      if (!user.mfaSecret) {
        return NextResponse.json({ error: "Nessuna configurazione in corso" }, { status: 400 });
      }

      const isValid = verifyTotpToken(user.mfaSecret, token);
      if (!isValid) {
        return NextResponse.json({ error: "Codice 2FA errato" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { mfaEnabled: true },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "disable-mfa") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaBackupCodes: null,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
