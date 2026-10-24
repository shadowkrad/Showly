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

  // 5. Clienti Newsletter & Registro Sponsorizzazioni
  await prisma.clienteNewsletter.deleteMany({});
  await prisma.clienteNewsletter.createMany({
    data: [
      {
        nome: "Sofia Fontana",
        email: "sofia.fontana@example.com",
        telefono: "+39 349 1122334",
        sponsor: "Instagram Adv",
        campagna: "Campagna Solitari Autunno",
        codiceReferral: "ig_autunno26",
        stato: "VIP",
        note: "Interessata a parure in platino e diamanti",
      },
      {
        nome: "Marco Rinaldi",
        email: "marco.rinaldi@example.com",
        telefono: "+39 340 9988776",
        sponsor: "Influencer @auroragems",
        campagna: "Stories IG Ottobre",
        codiceReferral: "aurora_vip",
        stato: "ATTIVO",
        note: "Iscritto dopo aver visto la storia still-life",
      },
      {
        nome: "Beatrice Galli",
        email: "beatrice.galli@example.com",
        telefono: "+39 338 5544332",
        sponsor: "Gala Arezzo 2026",
        campagna: "Sponsorizzazione Serata di Gala",
        codiceReferral: "gala2026",
        stato: "VIP",
        note: "Incontrata allo stand VIP",
      },
      {
        nome: "Leonardo Conti",
        email: "leonardo.conti@example.com",
        telefono: "+39 347 6655443",
        sponsor: "Passaparola",
        campagna: "Referral Clienti",
        stato: "ATTIVO",
        note: "Amico di famiglia di un cliente storico",
      },
      {
        nome: "Elena Moretti",
        email: "elena.moretti@example.com",
        telefono: "+39 335 1239874",
        sponsor: "Facebook Ads",
        campagna: "Promo Fedi Matrimonio",
        codiceReferral: "fb_fedi",
        stato: "LEAD",
        note: "Preventivo per matrimonio estate 2027",
      },
    ],
  });
  console.log("==> Inseriti 5 clienti newsletter con tracciamento sponsorizzazioni");

  // 6. Campagna Newsletter d'Esempio
  await prisma.campagnaNewsletter.deleteMany({});
  await prisma.campagnaNewsletter.create({
    data: {
      titolo: "Anteprima Privata Nuova Collezione Diamanti",
      oggettoEmail: "💎 Invito Esclusivo: Nuova Collezione in Bottega per i nostri VIP",
      messaggio:
        "Gentile ospite, siamo lieti di presentarle in anteprima assoluta la nostra nuova linea di creazioni d'autore, realizzata interamente a mano nel nostro atelier. La invitiamo a visionare i pezzi esclusivi o prenotare una visita privata in bottega.",
      sponsorCorrelato: "Gala Arezzo 2026",
      canale: "ENTRAMBI",
      destinatariFiltro: "SOLO_VIP",
      numeroDestinatari: 2,
      stato: "INVIATA",
      dataInviato: new Date(),
    },
  });
  console.log("==> Inserita 1 campagna newsletter dimostrativa");

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
