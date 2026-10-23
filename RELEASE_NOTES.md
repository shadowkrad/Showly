# 📦 Note di Rilascio — Showly

Tutte le modifiche, funzionalità e correzioni apportate al modulo **Showly** seguono rigorosamente la disciplina SemVer e la strategia di rilascio a doppio binario della Suite Taaaac.

---

## Novità della Versione 1.1.0 (In Sviluppo)
*Release Ufficiale di Nascita di Showly nella Suite Taaaac*

### 1. Vetrina Dinamica d'Autore & ShowGallery Stile Apple
- **Fotografia Protagonista**: layout visivo puro ad altissimo impatto per atelier d'alta moda, gioiellerie, oreficerie e botteghe d'arte.
- **ShowGallery Magnetica**: scorrimento orizzontale continuo con snap fluido, scheda panoramica still-life e barra di avanzamento dinamica.
- **Politica Prezzi Flessibile**: toggle rapido per mostrare i prezzi o nasconderli con etichette personalizzate (*"Quotazione su richiesta"*, *"Disponibile in bottega"*).
- **100% Testi Editabili**: parametrizzazione totale di ogni testo, etichetta e titolo attraverso la configurazione `showcaseConfig`.

### 2. Modulo "Metti da Parte" (Click & Reserve 24h)
- Possibilità per il cliente di riservare un pezzo dallo smartphone per 24 ore.
- Desk di gestione ordini con badge di stato (`IN_ATTESA`, `PRONTO_IN_BOTTEGA`, `RITIRATO`, `SCADUTO`).
- Notifica e sollecito rapido con 1-click su WhatsApp.

### 3. Live Showcase Studio Split-Screen
- Editor grafico in tempo reale con pannello sinistro di configurazione e simulatore destro interattivo con switch tra Smartphone 390px e Desktop.

### 4. Pacchetto Sicurezza Integrato (v1.0.6)
- Autenticazione a due fattori (TOTP MFA RFC 6238) con QR code e 8 codici di emergenza.
- Rate limiting anti brute-force (blocco 15 min dopo 5 fallimenti consecutivi).
- Protezione invisibile bot Honeypot.
- Tracciamento dispositivi fidati e audit log accessi.
- Lucchetto discreto 🔒 `/login` posizionato nel footer.
