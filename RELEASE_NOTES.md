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

### 3. Database Articoli con Mini-Editor Posizione Foto & Catalogo Privato "Cassaforte"
- **Archivio Articoli & Mini-Editor Fotografico (`/dashboard/catalogo`)**:
  - Database articoli dedicato (`ProdottoCreazione`) con codice, categoria, specifiche, prezzo, visibilità (*Vetrina Pubblica*, *Solo Cassaforte Privata*, *Nascosto*) e riordino rapido in vetrina (`↑` / `↓`).
  - Caricamento diretto sia da **Smartphone** (scatto fotocamera dal vivo `capture="environment"`) sia da **PC / Galleria** con conversione automatica WebP HD.
  - **Mini-Editor Visuale Posizione & Zoom Immagine**: trascinamento touch/mouse del punto focale (`posX%`, `posY%`) e regolazione zoom (`1.0x–2.0x`) con griglia dei terzi, anteprima commutabile *Quadrato 1:1* / *ShowGallery 16:11* e gestione ordine galleria multi-foto.
- **Catalogo Privato "Cassaforte" Limitato al Destinatario (`/dashboard/cassaforte` & `/cassaforte/[token]`)**:
  - Generazione di link privati personalizzati per singolo cliente o buyer (*es. `VIP-AURORA-2026`*) protetti da **PIN segreto**, **scadenza oraria**, **limite massimo di aperture** e **blocco automatico sul dispositivo del destinatario (`vincolaDispositivo`)** per impedire l'inoltro del catalogo a estranei.
  - Invio 1-Click su WhatsApp con link e PIN precompilati, monitoraggio in tempo reale delle aperture effettuate e revoca immediata dell'accesso.
- **Scudo Anti-Cattura, Anti-Registrazione & Anti-Salvataggio Modelli (`PhotoProtectionShield.tsx`)**:
  - **Oscuramento Istantaneo contro Programmi di Registrazione & Cattura Schermo**: rilevamento automatico di tasti screenshot (`PrintScreen`, `Win+Shift+S`, `Cmd+Shift+3/4/5`), combinazioni di salvataggio/esportazione (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`, `F12` / DevTools) e perdita di focus verso software di registrazione esterni (OBS, Snipping Tool, Screen Recorder), con attivazione immediata del sipario nero di sicurezza (`brightness-0 blur-3xl`) che oscura tutte le foto dei modelli.
  - **Corazzatura Immagini & Filigrana Forense Nominativa (`ProtectedModelImage`)**: blocco nativo di tasto destro, trascinamento drag-and-drop e pressione prolungata su smartphone (*Salva in Foto*), velo trasparente intercettore e filigrana forense diagonale con il nome del destinatario e il codice dell'invito.

### 4. Dashboard, Impostazioni & Live Showcase Studio Unificati
- **Impostazioni Showly (`/dashboard/impostazioni`)**: layout standard Taaaac a 2 colonne con 6 sezioni verticali (*Bottega & Vetrina*, *Camerino 24h & Prezzi*, *Dominio & SSL*, *Email & Notifiche*, *Dispositivi PWA*, *Aspetto & Brand*).
- **Hub Sincronizzazione Omnicanale v1.1.0**: sincronizzazione 1-Click degli orari della bottega con Google Maps, Meta (Facebook & IG), WhatsApp Business e Review Booster.
- **Live Showcase Studio Split-Screen**: editor grafico in tempo reale con pannello sinistro di configurazione, upload immagini WebP e simulatore destro interattivo con switch tra Smartphone 390px e Desktop.

### 4. Responsività Mobile Totale & Icona Ufficiale Personalizzata Showly
- **Icona Standard Modulo Showly (`ShowlyModuleIcon` & `public/icon.svg`)**: grafica ufficiale su squircle Taaaac (sfondo onice/antracite con cornice oro champagne, diamante taglio brillante sfaccettato su piedistallo espositivo e scintilla d'autore) integrata nell'Header della vetrina pubblica, nel Footer, nella pagina di Login, nella Sidebar gestionale (`TaaaacLogo` + card Atelier) e negli asset PWA/Favicon (`icon.svg`, `apple-touch-icon.png`, `icons/icon-192.png`, `icons/icon-512.png`, `manifest.json`).
- **Ottimizzazione Mobile, Pallino Flottante WhatsApp & Simulatore 390px (`isMobilePreview`)**:
  - Sostituita la barra verde WhatsApp in fondo alla sezione Bottega con il **Pallino Flottante Standard WhatsApp (`FloatingWhatsAppWidget.tsx`)** in basso a destra con animazione pulse e tooltip *"Scrivici su WhatsApp 💎"*, allineato a tutti gli altri moduli della suite Taaaac.
  - Risolto il disallineamento nel simulatore smartphone 390px (in `Impostazioni -> Aspetto & Brand` e `Live Showcase Studio`) dove le media query desktop (`md:`, `sm:`, `lg:`) causavano l'andata a capo del titolo, la fuoriuscita orizzontale delle voci menu e la comparsa delle barre di scorrimento bianche di Windows.
  - Introdotto menu mobile hamburger a tendina (`Header.tsx`), card calibrate per schermi compatti (`ShowGallery.tsx`), griglia a colonna singola (`CatalogGrid.tsx`, `AtelierSection.tsx`) e rimozione totale dello scroll orizzontale (`overflow-x-hidden` con scrollbar sottile trasparente).

### 5. Pacchetto Sicurezza Integrato (v1.0.6)
- Autenticazione a due fattori (TOTP MFA RFC 6238) con QR code e 8 codici di emergenza.
- Rate limiting anti brute-force (blocco 15 min dopo 5 fallimenti consecutivi).
- Protezione invisibile bot Honeypot.
- Tracciamento dispositivi fidati e audit log accessi.
- Lucchetto discreto d'accesso gestionale (`<Lock />`) posizionato nell'Header principale in alto a destra (allineato allo standard degli altri moduli Taaaac) e rimosso dal footer.
- Accesso Diretto Demo 1-Click (`👉 Accedi alla Demo (1-Click)`) attivo esclusivamente sull'ambiente dimostrativo (`cliente-demo` / Vercel), con protezione middleware delle rotte `/dashboard` e richiesta obbligatoria di credenziali per i tenant reali in produzione.
