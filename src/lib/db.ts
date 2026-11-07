import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const log: ("warn" | "error")[] = process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];

  // Sulla demo (ramo cliente-demo, Vercel) c'e' prisma/demo.db con clienti, punti e buoni di prova:
  // si copia in una zona scrivibile e si usa quella. Senza demo.db o fuori da Vercel non cambia nulla.
  if (process.env.VERCEL) {
    const demoPath = path.join(process.cwd(), "prisma", "demo.db");
    if (fs.existsSync(demoPath)) {
      const tmpDbPath = path.join("/tmp", "showly.db");
      try {
        const copiare =
          !fs.existsSync(tmpDbPath) ||
          fs.statSync(demoPath).mtimeMs > fs.statSync(tmpDbPath).mtimeMs ||
          fs.statSync(demoPath).size !== fs.statSync(tmpDbPath).size;
        if (copiare) fs.copyFileSync(demoPath, tmpDbPath);
        const url = `file:${tmpDbPath}`;
        process.env.DATABASE_URL = url;
        return new PrismaClient({ datasources: { db: { url } }, log });
      } catch (err) {
        console.warn("Avviso copia database demo in /tmp su Vercel:", err);
      }
    }
  }

  return new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Le tabelle si aggiornano con `prisma db push` all'installazione: qui non serve altro (esiste per le rotte condivise). */
export async function ensureDatabase(): Promise<void> {}
