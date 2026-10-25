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
- **Scudo Anti-Cattura Stile Disney+, Filigrana Forense Nominativa & Wrapper FLAG_SECURE (`PhotoProtectionShield.tsx`)**:
  - **Oscuramento Silenzioso Stile Disney+ / Netflix**: nessun popup invadente né sfocatura durante la normale visione dei modelli. All'avvio di qualsiasi strumento di cattura schermo (`Win+Shift+S`, `PrintScreen`, `Cmd+Shift+3/4/5`) o quando un software di registrazione/overlay toglie il focus alla finestra del browser, solo i riquadri delle foto protette (`<ProtectedModelImage>`) si spengono silenziosamente in nero puro (`#000000`), ripristinandosi automaticamente non appena lo strumento viene chiuso.
  - **Filigrana Forense Nominativa Anti-Leak per Smartphone (Web & PWA)**: nella Cassaforte Privata (`/cassaforte/[token]`), le foto contengono una filigrana diagonale semitrasparente e un micro-badge elegante recante il nome del destinatario e il codice univoco dell'invito (*es. `RISERVATO: MARIO ROSSI • #VIP-AURORA-2026`*). Se un cliente scatta uno screenshot con i tasti fisici del telefono (Power + Volume), l'immagine catturata rimarrà indelebilmente marchiata con la sua identità, disincentivando e tracciando qualsiasi tentativo di inoltro o copia non autorizzata.
  - **Wrapper Nativo Hardware-Level con `FLAG_SECURE` (Android / iOS)**: predisposta configurazione nativa Capacitor con `WindowManager.LayoutParams.FLAG_SECURE` in `MainActivity.java` (Android) e blocco cattura/registrazione in `AppDelegate.swift` (iOS). Quando compilata o distribuita come app nativa, il sistema operativo dello smartphone rifiuta fisicamente la combinazione tasti Volume+Power e le registrazioni dello schermo, restituendo un fotogramma 100% nero identico a Disney+, Netflix e alle applicazioni bancarie.

### 4. Registro Clienti, Newsletter & Tracciamento Sponsorizzazioni (`/dashboard/clienti`)
- **Registro Clienti & Lead Omnicanale (`ClienteNewsletter`)**:
  - Rubrica centralizzata dei contatti acquisiti dalla vetrina pubblica, dal passaparola o inseriti manualmente dal personale dell'Atelier.
  - Informazioni anagrafiche complete: nome, email, recapito WhatsApp, stato (`VIP`, `ATTIVO`, `LEAD`, `DISISCRITTO`), note interne riservate e storico data iscrizione/ultimo contatto.
- **Tracciamento Avanzato delle Sponsorizzazioni & Canali di Provenienza**:
  - Tracciamento automatico del canale o sponsor (*es. `Instagram Adv`*, *`Influencer @auroragems`*, *`Gala Arezzo 2026`*, *`Passaparola`*) sia da inserimento gestionale sia tramite rilevamento istantaneo dei parametri URL (`?sponsor=...`, `?utm_source=...`, `?ref=...`).
  - **Pannello KPI & Rendimento Sponsorizzazioni**: calcolo in tempo reale del numero di iscritti per ciascun partner/campagna, percentuale sul totale e tasso di conversione in clienti VIP e Lead.
  - Filtri dinamici istantanei: ricerca testuale e selezione sponsor per analizzare quali collaborazioni portano il maggior valore alla bottega.
- **Iscrizione Club Privato in Vetrina Pubblica (`Footer.tsx`)**:
  - Box d'iscrizione raffinato in stile atelier d'alta gioielleria nel footer della vetrina per raccogliere email o WhatsApp di ospiti interessati a selezioni riservate.
  - Riconoscimento automatico e feedback visivo dell'invito partner in caso di arrivo da link sponsorizzato.
- **Invio Newsletter & Broadcast d'Autore (`CampagnaNewsletter`)**:
  - Compositore messaggi esclusivi con selezione del canale (*Email*, *WhatsApp Broadcast*, *Entrambi*) e profilazione selettiva dei destinatari (*Tutti gli iscritti*, *Solo Clienti VIP*, *Solo iscritti da uno specifico Sponsor Partner*).
  - Storico cronologico di tutte le campagne inviate con monitoraggio del volume di destinatari raggiunti.
- **Integrazione Diretta con la Cassaforte Privata**:
  - Azione rapida 1-Click dal registro clienti per generare immediatamente un invito protetto alla Cassaforte VIP precompilato con il nome e il recapito del cliente selezionato.

### 5. Dashboard, Impostazioni & Live Showcase Studio Unificati
- **Impostazioni Showly (`/dashboard/impostazioni`)**: layout standard Taaaac a 2 colonne con 6 sezioni verticali (*Bottega & Vetrina*, *Camerino 24h & Prezzi*, *Dominio & SSL*, *Email & Notifiche*, *Dispositivi PWA*, *Aspetto & Brand*).
- **Hub Sincronizzazione Omnicanale v1.1.0**: sincronizzazione 1-Click degli orari della bottega con Google Maps, Meta (Facebook & IG), WhatsApp Business e Review Booster.
- **Live Showcase Studio Split-Screen**: editor grafico in tempo reale con pannello sinistro di configurazione, upload immagini WebP e simulatore destro interattivo con switch tra Smartphone 390px e Desktop.

### 6. Responsività Mobile Totale & Icona Ufficiale Personalizzata Showly
- **Icona Standard Modulo Showly (`ShowlyModuleIcon` & `public/icon.svg`)**: grafica ufficiale su squircle Taaaac (sfondo onice/antracite con cornice oro champagne, diamante taglio brillante sfaccettato su piedistallo espositivo e scintilla d'autore) integrata nell'Header della vetrina pubblica, nel Footer, nella pagina di Login, nella Sidebar gestionale (`TaaaacLogo` + card Atelier) e negli asset PWA/Favicon (`icon.svg`, `apple-touch-icon.png`, `icons/icon-192.png`, `icons/icon-512.png`, `manifest.json`).
- **Ottimizzazione Mobile, Pallino Flottante WhatsApp & Simulatore 390px (`isMobilePreview`)**:
  - Sostituita la barra verde WhatsApp in fondo alla sezione Bottega con il **Pallino Flottante Standard WhatsApp (`FloatingWhatsAppWidget.tsx`)** in basso a destra con animazione pulse e tooltip *"Scrivici su WhatsApp 💎"*, allineato a tutti gli altri moduli della suite Taaaac.
  - **Perfezionamento Grafico Bollino WhatsApp Ufficiale**: integrato il tracciato vettoriale ufficiale Meta WhatsApp (fumetto solido bianco puro `#FFFFFF` ad alta definizione con cornetta verde `#25D366` in risalto), eliminando il vecchio bordo vuoto wireframe e garantendo la massima nitidezza visiva su tutti i dispositivi.
  - Risolto il disallineamento nel simulatore smartphone 390px (in `Impostazioni -> Aspetto & Brand` e `Live Showcase Studio`) dove le media query desktop (`md:`, `sm:`, `lg:`) causavano l'andata a capo del titolo, la fuoriuscita orizzontale delle voci menu e la comparsa delle barre di scorrimento bianche di Windows.
  - Introdotto menu mobile hamburger a tendina (`Header.tsx`), card calibrate per schermi compatti (`ShowGallery.tsx`), griglia a colonna singola (`CatalogGrid.tsx`, `AtelierSection.tsx`) e rimozione totale dello scroll orizzontale (`overflow-x-hidden` con scrollbar sottile trasparente).

### 7. Pacchetto Sicurezza Integrato (v1.0.6)
- Autenticazione a due fattori (TOTP MFA RFC 6238) con QR code e 8 codici di emergenza.
- Rate limiting anti brute-force (blocco 15 min dopo 5 fallimenti consecutivi).
- Protezione invisibile bot Honeypot.
- Tracciamento dispositivi fidati e audit log accessi.
- Lucchetto discreto d'accesso gestionale (`<Lock />`) posizionato nell'Header principale in alto a destra (allineato allo standard degli altri moduli Taaaac) e rimosso dal footer.
- Accesso Diretto Demo 1-Click (`👉 Accedi alla Demo (1-Click)`) attivo esclusivamente sull'ambiente dimostrativo (`cliente-demo` / Vercel), con protezione middleware delle rotte `/dashboard` e richiesta obbligatoria di credenziali per i tenant reali in produzione.

### 8. 🎄 Calendario Festività Nazionali, Aperture Straordinarie Showroom & Preavviso a 7 Giorni
- **Motore Festività Nazionali Italiane con Calcolo Astronomico della Pasqua**: Calcolo dinamico e riconoscimento delle 12 festività ufficiali italiane (Natale, Capodanno, Epifania, Pasqua, Lunedì dell'Angelo, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, Tutti i Santi, Immacolata, Santo Stefano) tramite algoritmo di Meeus/Jones/Butcher.
- **Nuovo Pannello "Orari & Festività" in Dashboard (/dashboard/orari)**: Gestione dedicata degli orari settimanali di visita showroom e bottega, date speciali (chiusure per ferie/inventario o aperture straordinarie per eventi shopping natalizio, fiere d'arte o trunk show privati).
- **Banner Intelligente di Preavviso (7 Giorni di Anticipo)**: Banner proattivo in cima alla dashboard camerino che segnala con una settimana di anticipo l'arrivo di ogni festività, indicando se l'atelier risulterà aperto o chiuso e fornendo l'accesso 1-click per programmare aperture straordinarie.
