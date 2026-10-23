import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SHOWLY_CONFIG } from "../src/lib/config";

const prisma = new PrismaClient();

async function main() {
  console.log("==> Avvio seeding Showly v1.1.0 (Atelier Aurora)...");

  // 1. Password hash per admin predefinito
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  // 2. Utente Amministratore Esercente
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@atelieraurora.it" },
    update: {},
    create: {
      email: "admin@atelieraurora.it",
      passwordHash,
      nome: "Maestro Orafo",
      ruolo: "ESERCENTE",
      mfaEnabled: false,
    },
  });
  console.log("==> Creato o aggiornato utente admin:", adminUser.email);

  // 3. Impostazioni Vetrina con Configurazione Completa
  await prisma.impostazioni.upsert({
    where: { id: "singleton" },
    update: {
      nomeAttivita: "Atelier Aurora",
      mostraPrezzi: true,
      showcaseConfig: JSON.stringify(DEFAULT_SHOWLY_CONFIG),
    },
    create: {
      id: "singleton",
      nomeAttivita: "Atelier Aurora",
      telefono: "+39 0575 889211",
      whatsappPhone: "+39 340 000 0000",
      indirizzo: "Via del Corso 24, Arezzo",
      mostraPrezzi: true,
      showcaseConfig: JSON.stringify(DEFAULT_SHOWLY_CONFIG),
    },
  });
  console.log("==> Configurazione vetrina salvata con successo");

  // 4. Prenotazioni Camerino Dimostrative
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.prenotazioneCamerino.deleteMany({});
  await prisma.prenotazioneCamerino.createMany({
    data: [
      {
        nomeCliente: "Eleonora Conti",
        whatsapp: "+39 333 4567890",
        titoloPezzo: "Fede Classica Bombata 4mm",
        specifica: "Oro Giallo 750‰ • Misura 14",
        prezzo: "€ 390",
        stato: "IN_ATTESA",
        note: "Desidera provarla venerdì pomeriggio",
        dataScadenza: in24h,
      },
      {
        nomeCliente: "Marco Benetti",
        whatsapp: "+39 347 1234567",
        titoloPezzo: "Solitario Seta Pura",
        specifica: "Platino & Diamante 0.50ct",
        prezzo: "€ 2.400",
        stato: "PRONTO",
        note: "Richiesta confezione regalo",
        dataScadenza: in24h,
      },
    ],
  });
  console.log("==> Inserite 2 prenotazioni camerino di esempio");

  console.log("==> Seeding completato con successo!");
}

main()
  .catch((e) => {
    console.error("Errore durante il seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
