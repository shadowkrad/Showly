import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "./db";

// ============================================================================
// 1. IN-MEMORY BRUTE FORCE PROTECTOR (Sliding Window & Account Lock)
// ============================================================================

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const ipAttempts = new Map<string, RateLimitRecord>();
const accountAttempts = new Map<string, RateLimitRecord>();

const MAX_IP_ATTEMPTS = 5;
const IP_WINDOW_MS = 15 * 60 * 1000; // 15 minuti
const MAX_ACCOUNT_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minuti

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipAttempts.entries()) {
      if (now - record.firstAttemptAt > IP_WINDOW_MS && (!record.lockedUntil || now > record.lockedUntil)) {
        ipAttempts.delete(ip);
      }
    }
    for (const [key, record] of accountAttempts.entries()) {
      if (now - record.firstAttemptAt > IP_WINDOW_MS && (!record.lockedUntil || now > record.lockedUntil)) {
        accountAttempts.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export function getClientIp(req?: NextRequest | Request | Headers | null): string {
  if (!req) return "127.0.0.1";
  let headers: Headers;
  if ("headers" in req && req.headers instanceof Headers) {
    headers = req.headers;
  } else if ("headers" in req && typeof req.headers === "object") {
    headers = new Headers(req.headers as any);
  } else {
    headers = req as Headers;
  }

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const list = forwarded.split(",");
    return list[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

export function checkIpRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = ipAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  if (now - record.firstAttemptAt > IP_WINDOW_MS) {
    ipAttempts.delete(ip);
    return { allowed: true };
  }

  if (record.attempts >= MAX_IP_ATTEMPTS) {
    record.lockedUntil = now + LOCK_DURATION_MS;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(LOCK_DURATION_MS / 1000),
    };
  }

  return { allowed: true };
}

export function recordFailedIpAttempt(ip: string): void {
  const now = Date.now();
  const record = ipAttempts.get(ip);
  if (!record || now - record.firstAttemptAt > IP_WINDOW_MS) {
    ipAttempts.set(ip, {
      attempts: 1,
      firstAttemptAt: now,
      lockedUntil: null,
    });
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_IP_ATTEMPTS) {
      record.lockedUntil = now + LOCK_DURATION_MS;
    }
  }
}

export function resetIpAttempts(ip: string): void {
  ipAttempts.delete(ip);
}

export async function checkAccountLockout(email: string): Promise<{ locked: boolean; retryAfterSeconds?: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { lockedUntil: true, failedLoginAttempts: true },
    });

    if (!user) return { locked: false };

    if (user.lockedUntil) {
      const now = new Date();
      if (user.lockedUntil > now) {
        return {
          locked: true,
          retryAfterSeconds: Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 1000),
        };
      } else {
        await prisma.user.update({
          where: { email },
          data: { lockedUntil: null, failedLoginAttempts: 0 },
        });
      }
    }
  } catch (err) {
    console.error("Errore checkAccountLockout:", err);
  }
  return { locked: false };
}

export async function recordFailedAccountAttempt(email: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const nextAttempts = user.failedLoginAttempts + 1;
    let lockUntil: Date | null = null;
    if (nextAttempts >= MAX_ACCOUNT_ATTEMPTS) {
      lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: nextAttempts,
        lockedUntil: lockUntil,
      },
    });
  } catch (err) {
    console.error("Errore recordFailedAccountAttempt:", err);
  }
}

export async function resetAccountAttempts(email: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  } catch (err) {
    // ignore
  }
}

// ============================================================================
// 2. TOTP MFA UTILS (RFC 6238 Base32)
// ============================================================================

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(length = 20): string {
  const buffer = crypto.randomBytes(length);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function generateTotpUri(secret: string, accountName: string, issuer = "Taaaac Showly"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function computeTotp(secretBuffer: Buffer, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", secretBuffer).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const str = (code % 1000000).toString();
  return str.padStart(6, "0");
}

export function verifyTotpToken(secret: string, token: string, window = 1): boolean {
  if (!secret || !token) return false;
  const cleanToken = token.trim().replace(/\s+/g, "");
  if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) return false;

  try {
    const secretBuffer = base32ToBuffer(secret);
    const timeStep = 30;
    const currentCounter = Math.floor(Date.now() / 1000 / timeStep);

    for (let i = -window; i <= window; i++) {
      const expected = computeTotp(secretBuffer, currentCounter + i);
      if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleanToken))) {
        return true;
      }
    }
  } catch (err) {
    console.error("Errore verifyTotpToken:", err);
  }
  return false;
}

// ============================================================================
// 3. EMERGENCY BACKUP CODES (8 x 8 caratteri)
// ============================================================================

export function generateEmergencyBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous 0/O 1/I
  for (let i = 0; i < count; i++) {
    let code = "";
    for (let c = 0; c < 8; c++) {
      const idx = crypto.randomInt(0, chars.length);
      code += chars[idx];
      if (c === 3) code += "-"; // es. ABCD-EF23
    }
    codes.push(code);
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return crypto.createHash("sha256").update(clean).digest("hex");
}

export function verifyAndConsumeBackupCode(rawCode: string, hashedListJson: string | null): { valid: boolean; updatedJson: string } {
  if (!hashedListJson) return { valid: false, updatedJson: "[]" };
  try {
    const list: string[] = JSON.parse(hashedListJson);
    const targetHash = hashBackupCode(rawCode);
    const index = list.indexOf(targetHash);
    if (index !== -1) {
      list.splice(index, 1);
      return { valid: true, updatedJson: JSON.stringify(list) };
    }
  } catch {
    // ignore
  }
  return { valid: false, updatedJson: hashedListJson };
}

// ============================================================================
// 4. ACCESS LOG & TRUSTED DEVICE MANAGEMENT
// ============================================================================

export function computeDeviceFingerprint(userAgent: string | null, ip: string): { deviceHash: string; deviceName: string } {
  const ua = userAgent || "Unknown Device";
  const raw = `${ua}:::${ip}`;
  const deviceHash = crypto.createHash("sha256").update(raw).digest("hex");

  let deviceName = "Browser Web";
  if (/iPhone/i.test(ua)) deviceName = "Apple iPhone (Safari)";
  else if (/iPad/i.test(ua)) deviceName = "Apple iPad (Safari)";
  else if (/Android/i.test(ua)) deviceName = "Smartphone Android (Chrome)";
  else if (/Macintosh|Mac OS/i.test(ua)) deviceName = "Apple Mac (Browser)";
  else if (/Windows/i.test(ua)) deviceName = "PC Windows (Browser)";
  else if (/Linux/i.test(ua)) deviceName = "Computer Linux (Browser)";

  return { deviceHash, deviceName };
}

export async function logAccessAndCheckNewDevice(
  userId: string,
  evento: string,
  ip: string,
  userAgent: string | null
): Promise<{ isNewDevice: boolean }> {
  const { deviceHash, deviceName } = computeDeviceFingerprint(userAgent, ip);
  let isNewDevice = false;

  try {
    const existing = await prisma.trustedDevice.findUnique({
      where: {
        userId_deviceHash: { userId, deviceHash },
      },
    });

    if (!existing) {
      isNewDevice = true;
      await prisma.trustedDevice.create({
        data: {
          userId,
          deviceHash,
          deviceName,
          ipAddress: ip,
        },
      });
    } else {
      await prisma.trustedDevice.update({
        where: { id: existing.id },
        data: { lastUsedAt: new Date() },
      });
    }

    await prisma.accessLog.create({
      data: {
        userId,
        evento,
        ipAddress: ip,
        userAgent,
        isNewDevice,
      },
    });
  } catch (err) {
    console.error("Errore logAccessAndCheckNewDevice:", err);
  }

  return { isNewDevice };
}
