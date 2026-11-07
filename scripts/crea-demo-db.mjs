// Crea il database della DEMO di Showly (prisma/demo.db) con dati di fantasia: iscritti/clienti (anche con telefono fisso),
// punti fedelta', buoni di ogni tipo e buoni compleanno gia' pronti.
// Il catalogo dell'atelier non si crea qui: il gestionale lo riempie da solo con i pezzi di esempio quando e' vuoto.
// Le date sono relative a OGGI: si rigenera quando la demo invecchia.
//
// Uso:  node scripts/crea-demo-db.mjs      (oppure: npm run demo:rigenera)
// REGOLE: i link di tessere e buoni sono derivati da nomi/codici (sempre uguali), cosi' una rigenerazione
// non rompe i link gia' inviati. Mai dati demo nei database dei clienti veri.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "prisma", "demo.db");
const schemaTmp = path.join(root, "prisma", ".schema-demo.prisma");

// 1) Database nuovo con le tabelle esatte dello schema (stesso schema, altro file)
for (const f of [out, `${out}-journal`]) if (fs.existsSync(f)) fs.rmSync(f);
const schema = fs.readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8").replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url      = "file:./demo.db"');
fs.writeFileSync(schemaTmp, schema);
try {
  execSync(`npx prisma db push --schema "${schemaTmp}" --skip-generate --accept-data-loss`, { cwd: root, stdio: "pipe" });
} finally {
  fs.rmSync(schemaTmp, { force: true });
}

const { PrismaClient } = await import("@prisma/client");
const bcrypt = (await import("bcryptjs")).default;
const prisma = new PrismaClient({ datasources: { db: { url: `file:${out}` } } });

const tokenStabile = (seme) => createHash("sha256").update(`showly-demo:${seme}`).digest("base64url").slice(0, 24);

let seed = 20261106;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const oggi = new Date();
const giorno = (offset, ora = 0, min = 0) => new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + offset, ora, min, 0, 0);
const nascita = (anni, offsetGiorni) => {
  const t = giorno(offsetGiorni);
  return new Date(Date.UTC(t.getFullYear() - anni, t.getMonth(), t.getDate()));
};

async function main() {
  // ---- Utente esercente (come nel seed standard) e impostazioni ----
  await prisma.user.create({
    data: { email: "admin@atelieraurora.it", passwordHash: await bcrypt.hash("Admin123!", 10), nome: "Maestro Orafo", ruolo: "ESERCENTE", mfaEnabled: false },
  });
  await prisma.impostazioni.create({
    data: {
      id: "singleton",
      nomeAttivita: "Atelier Aurora",
      telefono: "0575 889211",
      indirizzo: "Via del Corso 24, Arezzo",
      fidelityEnabled: true,
      fidelityRules: JSON.stringify({
        enabled: true,
        pointsPerEuro: 1,
        welcomeBonusPoints: 15,
        minPointsToRedeem: 60,
        rewardVoucherMonths: 6,
        compleanno: { enabled: true, tipoValore: "PERCENTUALE", percentuale: 10, giorniAnticipo: 7, validitaGiorni: 30, spesaMinima: 80, inviaEmail: true },
        rewards: [
          { id: "rew_s1", name: "Pulizia e lucidatura gioielli omaggio", pointsRequired: 60, rewardType: "FREE_ITEM", freeItemName: "Pulizia e lucidatura di un gioiello" },
          { id: "rew_s2", name: "Sconto 20€ sul prossimo acquisto", pointsRequired: 120, rewardType: "DISCOUNT", discountAmount: 20 },
          { id: "rew_s3", name: "Pezzo in omaggio fino a 50€", pointsRequired: 250, rewardType: "FREE_ITEM", freeItemName: "Gioiello a scelta fino a 50€" },
        ],
      }),
    },
  });

  // ---- Iscritti / clienti (numeri finti; alcuni fissi, formati misti, compleanni vicini) ----
  const clienti = [
    ["Laura Ferrari", "3201000101", "laura.ferrari@example.com", nascita(34, 2), "Instagram Adv", "VIP"],
    ["Chiara Conti", "3201000102", "chiara.conti@example.com", nascita(29, 6), "Passaparola", "ATTIVO"],
    ["Elisa Greco", "3201000103", "elisa.greco@example.com", nascita(41, 12), "Gala Arezzo", "ATTIVO"],
    ["Francesca Marino", "3201000104", null, nascita(37, 25), "Diretto", "ATTIVO"],
    ["Valentina Gallo", "3201000106", null, nascita(26, -3), "Instagram Adv", "ATTIVO"],
    ["Giorgia Santoro", "3201000109", "giorgia.santoro@example.com", nascita(31, 40), "Influencer @aurora", "VIP"],
    ["Paola Rinaldi", "3201000111", "paola.rinaldi@example.com", nascita(52, 90), "Passaparola", "ATTIVO"],
    ["Sofia Ferrara", "3201000113", null, nascita(23, 150), "Diretto", "LEAD"],
    ["Camilla Leone", "3201000116", "camilla.leone@example.com", nascita(28, 200), "Gala Arezzo", "ATTIVO"],
    ["Teresa Vitale", "3201000120", null, nascita(47, 300), "Diretto", "ATTIVO"],
    ["Nadia Bindi", "3201000130", "nadia.bindi@example.com", nascita(39, 1), "Instagram Adv", "ATTIVO"],
    ["Marco Bianchi", "3331122334", "marco.bianchi@example.com", nascita(44, 33), "Diretto", "ATTIVO"],
    ["Davide Moretti", "3499988776", "d.moretti@example.com", nascita(36, 75), "Passaparola", "ATTIVO"],
    ["Federico Galli", "3285544332", "fedegalli@example.com", null, "Diretto", "LEAD"],
    ["Simone Fabbri", "3201000107", null, null, "Diretto", "LEAD"],
    ["Andrea Costa", "3201000108", "andrea.costa@example.com", nascita(28, 150), "Instagram Adv", "ATTIVO"],
    ["Maria Bartolini", "0575100201", null, nascita(71, 18), "Diretto", "ATTIVO"],
    ["Rosa Cecchi", "0575100202", null, nascita(68, 60), "Passaparola", "ATTIVO"],
    ["Franco Lucherini", "0575100203", null, nascita(75, 5), "Diretto", "ATTIVO"],
    ["Mario Pieri", "0575100204", "mario.pieri@example.com", nascita(66, 220), "Gala Arezzo", "VIP"],
    ["Tommaso Rossetti", "+39 320 100 0121", "tommaso.r@example.com", nascita(27, 130), "Instagram Adv", "ATTIVO"],
    ["Filippo Conti", "0039 3201000122", null, null, "Diretto", "ATTIVO"],
    ["Daniele Mancini", "320-1000123", "daniele.m@example.com", null, "Passaparola", "ATTIVO"],
    ["Alberto Rinaldi", "3201000125", "alberto.r@example.com", nascita(38, 33), "Diretto", "ATTIVO"],
    ["Enrico Bellini", "3201000127", "enrico.bellini@example.com", nascita(35, 180), "Gala Arezzo", "ATTIVO"],
    ["Fabio Lombardi", "32010", null, null, "Diretto", "LEAD"], // numero incompleto: "Da verificare"
  ];
  const creati = [];
  for (const [nome, telefono, email, dataNascita, sponsor, stato] of clienti) {
    creati.push(
      await prisma.clienteNewsletter.create({
        data: {
          nome,
          telefono,
          email,
          dataNascita,
          sponsor,
          stato,
          consensoPrivacy: true,
          loyaltyPoints: 0,
          loyaltyToken: tokenStabile(`tessera:${nome}`),
          ultimoContatto: giorno(-Math.floor(rnd() * 40)),
        },
      })
    );
  }

  // ---- Punti fedelta': l'atelier li assegna dalla cassa fedelta' (acquisti in negozio) ----
  for (const c of creati) {
    let tot = 0;
    const acquisti = Math.floor(rnd() * 4);
    for (let i = 0; i < acquisti; i++) {
      const spesa = Math.round((40 + rnd() * 260) * 10) / 10;
      const p = Math.floor(spesa);
      tot += p;
      await prisma.movimentoPunti.create({
        data: {
          clienteId: c.id,
          punti: p,
          tipo: "ACCREDITO",
          origine: "SPESA",
          importo: spesa,
          saldoDopo: tot,
          operatore: "Staff",
          descrizione: `Cassa: spesa ${spesa.toFixed(2)} € (+${p} pt)`,
          createdAt: giorno(-(1 + Math.floor(rnd() * 45)), 16),
        },
      });
    }
    if (tot >= 150 && rnd() > 0.5) {
      await prisma.movimentoPunti.create({
        data: { clienteId: c.id, punti: 60, tipo: "RISCATTO", origine: "PREMIO", premioId: "rew_s1", saldoDopo: tot - 60, operatore: "Staff", descrizione: "Premio: Pulizia e lucidatura gioielli omaggio", createdAt: giorno(-3) },
      });
      tot -= 60;
    }
    await prisma.clienteNewsletter.update({ where: { id: c.id }, data: { loyaltyPoints: tot } });
  }

  // ---- Buoni di esempio ----
  const buoni = [
    ["BUO-DEMO1-REGAL", "REGALO", "IMPORTO", 100, 100, null, null, 120, null, "Giulia Moretti", "Marco Rossi", "Buon anniversario!", null, true, null, "ATTIVA"],
    ["BUO-DEMO2-REGAL", "REGALO", "IMPORTO", 150, 90, null, null, 90, null, "Paola Rinaldi", "Andrea Ferrara", "Per te, con affetto", null, true, null, "ATTIVA"],
    ["BUO-DEMO3-COMPE", "COMPENSAZIONE", "IMPORTO", 30, 30, null, null, null, 2, "", "", null, null, false, "Ritardo nella consegna del pezzo su misura", "ATTIVA"],
    ["BUO-DEMO5-SERVI", "GESTO_COMMERCIALE", "SERVIZIO", 0, 0, null, "Pulizia e lucidatura di un gioiello", 60, 7, "", "", null, null, false, "Cliente fedele da 3 anni", "ATTIVA"],
    ["BUO-DEMO6-PUNTI", "PREMIO_PUNTI", "IMPORTO", 20, 20, null, null, 14, 9, "", "", null, null, false, "Premio punti: Sconto 20€ (120 punti)", "ATTIVA"],
    ["BUO-DEMO7-SCADU", "SCONTO", "PERCENTUALE", 0, 0, 10, null, -10, null, "", "", null, 100, false, "Promozione di ottobre", "ATTIVA"],
    ["BUO-DEMO8-USATO", "REGALO", "IMPORTO", 50, 0, null, null, 200, null, "Anna Neri", "Luca Verdi", null, null, true, null, "RISCATTATA"],
  ];
  for (const [codice, motivo, tipoValore, importo, residuo, percentuale, servizio, giorniScad, idx, acquirente, beneficiario, messaggio, spesaMinima, usoParziale, nota, stato] of buoni) {
    const cl = idx != null ? creati[idx] : null;
    const g = await prisma.giftCard.create({
      data: {
        codice,
        tokenPubblico: tokenStabile(`buono:${codice}`),
        motivo,
        tipoValore,
        importoIniziale: importo,
        saldoResiduo: residuo,
        percentuale,
        descrizioneServizio: servizio,
        clienteId: cl ? cl.id : null,
        spesaMinima,
        usoParziale,
        note: nota,
        acquirenteNome: acquirente,
        beneficiarioNome: beneficiario || (cl ? cl.nome : ""),
        beneficiarioMessaggio: messaggio,
        dataScadenza: giorniScad == null ? null : giorno(giorniScad),
        stato,
        creatoDa: "Staff",
      },
    });
    await prisma.movimentoGiftCard.create({
      data: { giftCardId: g.id, tipo: "EMISSIONE", importo, saldoDopo: importo, operatore: "Staff", note: "Emesso", createdAt: giorno(-20) },
    });
    if (tipoValore === "IMPORTO" && residuo < importo) {
      await prisma.movimentoGiftCard.create({
        data: { giftCardId: g.id, tipo: "USO", importo: importo - residuo, saldoDopo: residuo, operatore: "Staff", note: `Sconto di ${(importo - residuo).toFixed(2)} € in cassa`, createdAt: giorno(-8) },
      });
    }
  }

  // ---- Buoni compleanno "automatici" gia' creati per chi compie gli anni nei prossimi 7 giorni ----
  // (nella demo ogni copia del database e' separata: creandoli qui restano uguali ovunque e l'automatismo non crea doppioni)
  for (const c of creati) {
    if (!c.dataNascita) continue;
    const inizioOggi = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());
    let comp = new Date(oggi.getFullYear(), c.dataNascita.getUTCMonth(), c.dataNascita.getUTCDate());
    if (comp < inizioOggi) comp = new Date(oggi.getFullYear() + 1, c.dataNascita.getUTCMonth(), c.dataNascita.getUTCDate());
    if (comp > new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 7)) continue;
    const codice = `BUO-COMP-${c.nome.slice(0, 3).toUpperCase()}${comp.getFullYear()}`;
    const g = await prisma.giftCard.create({
      data: {
        codice,
        tokenPubblico: tokenStabile(`buono:${codice}`),
        motivo: "COMPLEANNO",
        tipoValore: "PERCENTUALE",
        importoIniziale: 0,
        saldoResiduo: 0,
        percentuale: 10,
        clienteId: c.id,
        spesaMinima: 80,
        usoParziale: false,
        note: `Buono compleanno ${comp.getFullYear()} (automatico)`,
        acquirenteNome: "Attività",
        beneficiarioNome: c.nome,
        dataScadenza: new Date(comp.getTime() + 30 * 86400000),
        stato: "ATTIVA",
        creatoDa: "Automatico",
      },
    });
    await prisma.movimentoGiftCard.create({
      data: { giftCardId: g.id, tipo: "EMISSIONE", importo: 0, saldoDopo: 0, operatore: "Automatico", note: "Emesso: Buono compleanno", createdAt: giorno(-1) },
    });
    if (c.email && c.stato !== "DISISCRITTO") {
      await prisma.movimentoGiftCard.create({
        data: { giftCardId: g.id, tipo: "INVIO", importo: 0, saldoDopo: 0, operatore: "Automatico", note: `Email simulata (demo) a ${c.email}`, createdAt: giorno(-1) },
      });
    }
  }

  const [nc, nm, nb] = await Promise.all([prisma.clienteNewsletter.count(), prisma.movimentoPunti.count(), prisma.giftCard.count()]);
  console.log(`Demo creata: ${out}`);
  console.log(`Clienti ${nc} | Movimenti punti ${nm} | Buoni ${nb}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
