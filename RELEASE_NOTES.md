# 📦 Note di Rilascio — Showly

Tutte le modifiche, funzionalità e correzioni apportate al modulo **Showly** seguono rigorosamente la disciplina SemVer e la strategia di rilascio a doppio binario della Suite Taaaac.

---

## Novità della Versione 1.1.3 (Patch)

### 👤 CRM & Scheda Cliente Unificata in Stile Schedly con Gestione Punti e Invio Tessera
- **Nuova scheda dettaglio cliente (`/dashboard/clienti/[id]`) e API `/api/clienti/[id]` (`GET`/`PUT`/`DELETE`)**: introdotta anche in Showly la pagina scheda cliente dedicata accessibile direttamente tramite il tasto **Scheda →** dall'elenco clienti, con colonna punti fedeltà in vista, anagrafica completa (sponsor, stato, compleanno, privacy GDPR), buoni attivi e prenotazioni camerino.
- **Gestione punti nel profilo e invio manuale tessera (`ClienteFedeltaPanel`)**: consente di accreditare punti o riscattare premi direttamente dal profilo, aprire/copiare il link della tessera digitale (`/tessera/[token]`) e generare automaticamente il messaggio personalizzato da inviare manualmente tramite **WhatsApp (`wa.me`)** o **Email (`mailto:`)**.

### 📱 Icona dell'App e della Scheda Browser Sempre Nitida e Aggiornata
- **Aggiornamento immediato al cambio logo/icona**: ogni volta che il titolare carica una nuova icona o un nuovo logo nello Studio/Impostazioni, l'indirizzo dell'icona nella pagina e nel manifesto PWA include automaticamente un codice di versione univoco (`&v=`). In questo modo browser e smartphone scaricano subito la nuova immagine senza restare bloccati sulla vecchia copia in memoria.
- **Formato e dimensioni perfetti per ogni schermo (`sharp`)**: l'endpoint `/api/pwa-icon` e l'icona della tessera fedeltà digitale (`/tessera/[token]/icona`) convertono e ridimensionano sempre l'immagine in un **PNG quadrato reale** alle misure esatte richieste (`32×32`, `180×180`, `192×192`, `512×512`), partendo anche da immagini WebP, JPEG o SVG.
- **Icona iPhone su fondo opaco e icona Android adattiva (`maskable`)**: per iPhone (`180×180`) le trasparenze vengono appiattite su sfondo bianco evitando il riquadro nero di iOS; per Android (`maskable=1`) il logo viene centrato con margine di sicurezza del 10% per lato sul colore dell'atelier così da non venire tagliato dalle icone tonde o a goccia.

### 🔄 Sincronizzazione Canali Più Chiara
- **Sincronizzazione canali più chiara**: se il servizio centrale non risponde per un momento, la scheda dice "stato non disponibile, riprova tra poco" invece di far credere che Google e Facebook non siano collegati, e non blocca la sincronizzazione.

#### 💡 Guida per Aggiornare l'Icona già Salvata sulla Schermata Home dello Smartphone
Le app web (PWA) già aggiunte in precedenza sulla schermata Home del telefono conservano la vecchia icona perché i sistemi operativi mobili (iOS Safari e Android Chrome) salvano l'immagine in una memoria permanente del telefono al momento del primo salvataggio. Per vedere subito la nuova icona ad alta definizione:
1. **Su iPhone (Safari)**:
   - Tieni premuto il dito sulla vecchia icona dell'app nella schermata Home e tocca **Elimina segnalibro** (oppure **Rimuovi app**).
   - Apri **Safari**, vai all'indirizzo del gestionale (o della tua tessera fedeltà), tocca il pulsante **Condividi** (il quadrato con la freccia verso l'alto in basso) e scegli **Aggiungi alla schermata Home**.
2. **Su Android (Chrome)**:
   - Tieni premuto il dito sulla vecchia icona nella schermata Home e trascinala su **Rimuovi** / **Disinstalla**.
   - Apri **Chrome**, visita l'indirizzo del gestionale (o della tua tessera fedeltà), tocca il menu **⋮** in alto a destra e seleziona **Aggiungi a schermata Home** (oppure **Installa app**).


---

### 🛠 Buoni Regalo
- **Buoni e biglietti senza contatto**: se il buono non ha un cliente con email o cellulare, il modulo lo segnala, propone di creare la scheda cliente e, prima di emettere, chiede conferma (senza contatto il buono si può solo stampare). Nella consegna il pulsante WhatsApp mancante ora ha una spiegazione.
- **Riscatto rapido dall'elenco buoni**: ogni buono attivo ha il pulsante "Riscatta" direttamente nella riga (dove si vede il codice): per i servizi basta confermare, per gli importi si scrive la spesa del cliente e si vede lo sconto prima di confermare.

## Novità della Versione 1.1.2 (Patch)

- Il pallino WhatsApp compare solo nella vetrina pubblica del sito: non piu' nelle pagine interne, nelle tessere e nei buoni dei clienti (prima bastava una pagina non prevista per vederlo).
### 1. 👤 Clienti e Iscritti Uniti
- **Un numero, un cliente**: gli iscritti alla newsletter sono la base clienti dell'atelier. Lo stesso telefono (anche scritto con spazi, trattini o +39) è sempre lo stesso contatto: il gestionale lo segnala e, dalla newsletter pubblica, riconosce chi è già iscritto.
- **Data di nascita** facoltativa nella scheda del contatto, base per il buono compleanno.

### 2. 🎟️ Fedeltà a Punti Vera
- **Cassa fedeltà** per gli acquisti in atelier: si cerca il cliente per telefono, nome, email o link della tessera, si accreditano i punti sulla spesa e si riscattano i premi. (Showly non gestisce gli incassi: i punti si assegnano da qui.)
- **Impostazioni salvate davvero**: prima le regole della fedeltà non venivano memorizzate; ora regole e premi si salvano e si rileggono.
- **Tessera digitale** con colore e nome dell'atelier (link privato con QR), aggiungibile alla schermata Home del telefono. Le pagine Fedeltà e Buoni non sono più schermate di esempio.

### 3. 🎁 Buoni Completi, Invio e Stampa
- **Un buono per ogni motivo**: regalo, sconto, compensazione, gesto commerciale, premio punti, compleanno, promozione; valore in euro, percentuale o servizio in omaggio; scadenza facoltativa, spesa minima, uso in più volte o unico.
- **Cassa con anteprima**, annullo con motivo e movimenti registrati. **Email** (di default, dal servizio Taaaac), **WhatsApp a scelta dell'esercente** (mai in automatico, mai verso i fissi), pagina del buono con QR, **stampa A4 o ricevuta da 80 mm** e ristampa con lo stesso codice.

### 4. 🎂 Compleanno e Premi che Diventano Buoni
- **Buono compleanno automatico**, una volta per cliente e per anno, con email solo a chi è iscritto e non disiscritto. Parte quando si apre la pagina Buoni o da `/api/cron/compleanni`.
- **Premio punti → buono**: riscattando un premio si scalano i punti e nasce un buono intestato al cliente, nella stessa operazione.

### 5. 🏪 Dati dell'Attività e Orari in un Solo Posto
- **Una sola sede per i dati**: nome, sede, telefono, email, **descrizione** e **orari** della bottega si modificano solo in Impostazioni. Prima la pagina Orari mostrava un "salvato" che non salvava nulla e il pulsante di sincronizzazione non inviava niente a Google.
- **Vetrina, Google, Facebook e Instagram** leggono gli stessi orari, con le chiusure e le ferie della pagina Orari; "Sincronizza" ora li invia davvero.
- **Studio**: mostra questi dati in sola lettura (con l'interruttore "Mostra l'indirizzo") e non può più sovrascriverli; colori, logo e foto restano solo nello Studio.


### 🎨 Studio Grafico Buoni Regalo & Biglietti da Visita (Solo Fronte o Fronte/Retro)
- **Dati di biglietti e buoni: ereditati, modificabili solo se vuoi**: nome, recapiti e orari stampati sono sempre quelli di Impostazioni. Nella scheda *5. Dati* dell'editor puoi, su tua scelta esplicita, usare testi diversi solo su biglietti e buoni ("Modifica solo qui") e tornare ai dati di Impostazioni con un clic ("Ripristina"). Nulla di un altro cliente compare più come esempio.
- **Editor Visivo in Tempo Reale**: in *Impostazioni → Biglietti & Buoni* (e direttamente dalla pagina *Buoni*) puoi personalizzare e vedere subito l'anteprima 1:1 del tuo **Biglietto da Visita (85 × 55 mm)** e dei **Buoni Regalo**, con guide dei margini di taglio attivabili.
- **5 Stili + Sfondo Personalizzato**: scegli tra *Botanico & Luxury* (con rami d'ulivo, stelline ✦ e filetti dorati), *Classico Elegante*, *Heritage & Artigianale*, *Moderno & Minimal* o *Sfondo Personalizzato Puro*. Puoi anche caricare una tua immagine/texture di sfondo distinta per Fronte, Retro e Buoni e regolare il **velo di contrasto** per mantenere le scritte sempre nitide.
- **Biglietto da Visita Solo Fronte oppure Fronte + Retro**:
  - **Solo Fronte**: stampa su un solo lato (1 pagina A4 da 10 biglietti), con opzione per mostrare una riga compatta degli orari o il QR di prenotazione direttamente sul fronte.
  - **Fronte + Retro**: fronte con medaglione/logo (mai ritagliato) e recapiti + retro compilato in automatico con gli **orari ufficiali dell'attività**, il QR Code di prenotazione o le righe promemoria prossimo appuntamento (2 pagine A4 a registro con 10 fronti + 10 retri, oppure formato singolo 1:1 per tipografia).
- **Nuovo Cartoncino Regalo per Busta**: oltre a *Stampa A4* e *Ricevuta 80 mm*, i buoni si stampano anche come **Cartoncino Regalo panoramico** da consegnare in busta regalo, coordinato al tema dell'attività.

---

## Novità della Versione 1.1.1 (Patch)

### 1. ✈️ Telegram Gestito da Taaaac Core (Hub Centralizzato)
- **Un solo posto per configurare Telegram**: il pannello Telegram locale è sostituito da una scheda di sola lettura (stato, bot, avvisi attivi) con il link al portale Taaaac, da cui si attiva o disattiva il canale.
- **Nessun token nel modulo**: token del bot e chat ID non vengono più inseriti né salvati nelle impostazioni del modulo, e il test non passa più dal browser.
- **Stato letto dal Core**: la scheda legge `telegram*` da `/api/public/tenant-config` (mai token né chat ID).

---

## Novità della Versione 1.0.8 (Hotfix / Patch)

### 1. 🎨 Live Studio Completo & Vetrina 100% Personalizzabile
- **Editing Totale Senza Campi Cablati**: Riprogettato completamente lo Studio Vetrina suddiviso in 6 tab funzionali (*Brand*, *ShowGallery*, *Atelier & Bottega*, *Azienda & Fisco*, *Catalogo*, *Footer & Newsletter*).
- **Personalizzazione Box Newsletter**: Diciture, badge e testi di invito al Club Privato/Newsletter ora completamente configurabili dall'esercente con preview in tempo reale.
- **Dati Atelier e Posizione Dinamici**: Orari feriali, sabato e domenica, indirizzo bottega e pulsante indicazioni stradali interamente gestiti dal pannello di controllo.

### 2. 🔐 Autenticazione Biometrica Rapida WebAuthn FIDO2 & Gestione Dispositivi
- **Accesso Istantaneo con FaceID / Impronta / PIN**: Introdotto il supporto standard FIDO2 WebAuthn per lo sblocco immediato del gestionale senza dover digitare ogni volta password o PIN.
- **Gestione Dispositivi Autorizzati**: Scheda dedicata nelle impostazioni dell'atelier per registrare e revocare smartphone, tablet e postazioni da remoto con visualizzazione di IP e data di ultimo utilizzo.
- **Supporto Multi-Origin & Sicurezza Avanzata**: Piena compatibilità con domini personalizzati e certificati di sicurezza hardware integrati nel dispositivo.

---

## Novità della Versione 1.0.7 (Hotfix / Patch)

### 1. 🔐 Autenticazione Distinta: Email + Password Titolare & PIN Staff Showroom
- **Accesso Titolare Diretto con Email e Password**: Il titolare dello showroom/atelier accede inserendo l'indirizzo email e la password ricevuti al momento della registrazione o aggiornati nel proprio account Taaaac, eliminando la richiesta confusa del solo PIN/Password generica.
- **PIN Tastierino Touch Dedicato ai Collaboratori**: Il tastierino numerico PIN rapido è ora dedicato esclusivamente agli operatori di sala e collaboratori dell'atelier per sbloccare rapidamente i tablet e le postazioni showroom.
- **Centralizzazione Sicurezza e MFA su Taaaac Core**: Le impostazioni avanzate di sicurezza (2FA TOTP, codici di recupero, cambio password) sono centralizzate al 100% nella dashboard utente di Taaaac (taaaac.eu/portal), semplificando l'esperienza all'interno del modulo satellite.

---
## Novità della Versione 1.1.0
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
