export interface ShowlyConfig {
  brand: {
    name: string;
    tagline: string;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    accentColor: string;
  };
  business?: {
    ragioneSociale: string;
    partitaIva: string;
    titolare: string;
    emailContatto: string;
    telefono: string;
    ritiroInBottega24h: boolean;
    notificaNuovePrenotazioni: boolean;
  };
  pricing: {
    showPricesGlobally: boolean;
    hiddenPriceFallbackText: string;
  };
  navigation: {
    highlightLabel: string;
    collectionsLabel: string;
    atelierLabel: string;
    whatsappLabel: string;
    ctaButtonLabel: string;
  };
  hero: {
    tagText: string;
    headline: string;
    imageUrl: string;
    exploreButtonLabel: string;
  };
  showgallery: {
    tagLabel: string;
    sectionTitle: string;
    slides: Array<{
      id: string;
      title: string;
      specs: string;
      price: string;
      showPriceOverride?: boolean;
      imageUrl: string;
      posX?: number;
      posY?: number;
      zoom?: number;
      ctaText: string;
    }>;
  };
  catalog: {
    tagLabel: string;
    sectionTitle: string;
    categories: string[];
    items: Array<{
      id: string;
      code?: string;
      title: string;
      category: string;
      specs: string;
      price: string;
      imageUrl: string;
      galleryImages?: string[];
      posX?: number;
      posY?: number;
      zoom?: number;
      visibilita?: "PUBBLICO" | "CASSAFORTE" | "NASCOSTO";
      inEvidenza?: boolean;
      showPriceOverride?: boolean;
    }>;
  };
  atelier: {
    tagLabel: string;
    heading: string;
    photoUrl: string;
    sectionTitle: string;
    description: string;
    statusLiveText: string;
    hoursWeekdayText: string;
    hoursSaturdayText: string;
    hoursSundayText: string;
    addressText: string;
    directionsButtonText: string;
    whatsappButtonText: string;
  };
  reserveModal: {
    tagLabel: string;
    title: string;
    description: string;
    submitButtonLabel: string;
    successAlertMessage: string;
    whatsappTemplateMessage: string;
  };
  footer: {
    legalText: string;
    privacyPolicyLabel: string;
    lockAdminLabel: string;
    newsletterBadgeText?: string;
    newsletterTitle?: string;
    newsletterSubtitle?: string;
  };
}

export const DEFAULT_SHOWLY_CONFIG: ShowlyConfig = {
  brand: {
    name: "Atelier Aurora",
    tagline: "Bottega Orafa & Manifattura d'Autore",
    logoUrl: null,
    faviconUrl: null,
    accentColor: "#D4AF37",
  },
  business: {
    ragioneSociale: "Atelier Aurora S.r.l.",
    partitaIva: "01928374652",
    titolare: "Aurora Moretti",
    emailContatto: "info@atelieraurora.it",
    telefono: "+39 0575 889211",
    ritiroInBottega24h: true,
    notificaNuovePrenotazioni: true,
  },
  pricing: {
    showPricesGlobally: true,
    hiddenPriceFallbackText: "Quotazione su Richiesta",
  },
  navigation: {
    highlightLabel: "In Evidenza",
    collectionsLabel: "Collezioni",
    atelierLabel: "La Bottega",
    whatsappLabel: "WhatsApp ↗",
    ctaButtonLabel: "Blocca in Negozio",
  },
  hero: {
    tagText: "Collezione Nuova Stagione • Manifattura Italiana",
    headline: "Forme pure. <br/>Luce senza tempo.",
    imageUrl:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=90",
    exploreButtonLabel: "Esplora la Collezione ↓",
  },
  showgallery: {
    tagLabel: "SELEZIONE IN VETRINA",
    sectionTitle: "I Pezzi Iconici",
    slides: [
      {
        id: "slide-1",
        title: "Fede Classica Bombata 4mm",
        specs: "Oro Giallo 750‰ • Lavorazione a Specchio Senza Saldature",
        price: "€ 390",
        imageUrl:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90",
        posX: 50,
        posY: 50,
        zoom: 1,
        ctaText: "Metti da Parte (24h) →",
      },
      {
        id: "slide-2",
        title: "Girocollo Catena Venezia",
        specs: "Oro Bianco e Brillante Punto Luce Taglio Cuore",
        price: "€ 820",
        imageUrl:
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=90",
        posX: 50,
        posY: 50,
        zoom: 1,
        ctaText: "Metti da Parte (24h) →",
      },
      {
        id: "slide-3",
        title: "Bracciale Rigido Martellato",
        specs: "Oro Rosa Satinato • Finitura Artigianale a Mano",
        price: "€ 1.250",
        imageUrl:
          "https://images.unsplash.com/photo-1611591475155-4284ec289e61?auto=format&fit=crop&w=1200&q=90",
        posX: 50,
        posY: 50,
        zoom: 1,
        ctaText: "Metti da Parte (24h) →",
      },
      {
        id: "slide-4",
        title: "Solitario Seta Pura",
        specs: "Platino 950 e Diamante Taglio Brillante 0.50ct",
        price: "€ 2.400",
        imageUrl:
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=90",
        posX: 50,
        posY: 50,
        zoom: 1,
        ctaText: "Metti da Parte (24h) →",
      },
    ],
  },
  catalog: {
    tagLabel: "CATALOGO ATTIVO",
    sectionTitle: "Tutte le Creazioni",
    categories: ["Tutti", "Anelli & Fedi", "Collane", "Bracciali", "Punti Luce"],
    items: [
      {
        id: "cat-1",
        code: "AUR-101",
        title: "Fede Classica Bombata 4mm",
        category: "Anelli & Fedi",
        specs: "Oro Giallo 750‰ • Lavorazione Senza Saldature",
        price: "€ 390",
        imageUrl:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85",
        posX: 50,
        posY: 50,
        zoom: 1,
        visibilita: "PUBBLICO",
        inEvidenza: true,
      },
      {
        id: "cat-2",
        code: "AUR-102",
        title: "Girocollo Seta con Pendente",
        category: "Collane",
        specs: "Oro Bianco 18kt • Punto Luce 0.25ct",
        price: "€ 820",
        imageUrl:
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=85",
        posX: 50,
        posY: 50,
        zoom: 1,
        visibilita: "PUBBLICO",
        inEvidenza: true,
      },
      {
        id: "cat-3",
        code: "AUR-103",
        title: "Bracciale Rigido Martellato",
        category: "Bracciali",
        specs: "Oro Rosa 750‰ • Finitura a Mano",
        price: "€ 1.250",
        imageUrl:
          "https://images.unsplash.com/photo-1611591475155-4284ec289e61?auto=format&fit=crop&w=800&q=85",
        posX: 50,
        posY: 50,
        zoom: 1,
        visibilita: "PUBBLICO",
        inEvidenza: true,
      },
      {
        id: "cat-4",
        code: "AUR-104",
        title: "Solitario Seta Pura",
        category: "Anelli & Fedi",
        specs: "Platino 950 & Diamante 0.50ct GIA",
        price: "€ 2.400",
        imageUrl:
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=85",
        posX: 50,
        posY: 50,
        zoom: 1,
        visibilita: "PUBBLICO",
        inEvidenza: true,
      },
      {
        id: "cat-5",
        code: "AUR-105",
        title: "Orecchini a Cerchio Ondulati",
        category: "Punti Luce",
        specs: "Oro Giallo Spazzolato 18kt",
        price: "€ 440",
        imageUrl:
          "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85",
        posX: 50,
        posY: 50,
        zoom: 1,
        visibilita: "PUBBLICO",
        inEvidenza: false,
      },
      {
        id: "cat-6",
        code: "AUR-106",
        title: "Veretta Diamanti Pavé",
        category: "Anelli & Fedi",
        specs: "Oro Bianco con 7 Diamanti F-VS1",
        price: "€ 1.150",
        imageUrl:
          "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=85",
        posX: 50,
        posY: 50,
        zoom: 1,
        visibilita: "PUBBLICO",
        inEvidenza: false,
      },
      {
        id: "vault-1",
        code: "CAV-901",
        title: "Collier Alta Gioielleria Imperiale",
        category: "Collane",
        specs: "Platino 950 • Smeraldo Colombiano 2.10ct & Pavé di Brillanti (Pezzo Unico Cassaforte)",
        price: "€ 6.800",
        imageUrl:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=90",
        posX: 50,
        posY: 45,
        zoom: 1.05,
        visibilita: "CASSAFORTE",
        inEvidenza: false,
      },
      {
        id: "vault-2",
        code: "CAV-902",
        title: "Anello Trilogy Réserve d'Autore",
        category: "Anelli & Fedi",
        specs: "Oro Bianco 750‰ • 3 Diamanti Taglio Smeraldo Certificati GIA (1.80ct tot.)",
        price: "€ 4.950",
        imageUrl:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=90",
        posX: 50,
        posY: 50,
        zoom: 1.1,
        visibilita: "CASSAFORTE",
        inEvidenza: false,
      },
    ],
  },
  atelier: {
    tagLabel: "Bottega Storica • Tradizione dal 1984",
    heading: "La Cura del Dettaglio Fatto a Mano",
    photoUrl:
      "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&w=1200&q=85",
    sectionTitle: "Vieni a Trovarci in Bottega",
    description:
      "Ogni pezzo nasce nel nostro banco da lavoro ad Arezzo. Vieni a scoprire le nostre finiture dal vivo, provare i tuoi modelli preferiti o progettare una creazione su misura insieme a noi.",
    statusLiveText: "Aperto Oggi • fino alle 19:30",
    hoursWeekdayText: "Lun – Ven: 09:30 – 13:00 | 15:30 – 19:30",
    hoursSaturdayText: "Sabato: 09:30 – 19:30 (Orario Continuato)",
    hoursSundayText: "Domenica: Chiuso",
    addressText: "Via del Corso 24, 52100 Arezzo (AR)",
    directionsButtonText: "Indicazioni Mappa ↗",
    whatsappButtonText: "💬 Contatta su WhatsApp",
  },
  reserveModal: {
    tagLabel: "PROVA GRATUITA IN BOTTEGA",
    title: "Metti da Parte la Creazione",
    description:
      "Lo terremo riservato a tuo nome per 24 ore senza alcun impegno di acquisto. Riceverai un promemoria con le indicazioni per venire a provarlo.",
    submitButtonLabel: "Conferma Prenotazione Senza Impegno",
    successAlertMessage: "Creazione riservata con successo per 24 ore!",
    whatsappTemplateMessage:
      "Salve Atelier Aurora! Ho appena riservato la creazione {titoloPezzo} tramite la vetrina online per una prova in bottega.",
  },
  footer: {
    legalText: "Atelier Aurora S.r.l. • P.IVA 01928374652 • Arezzo, Italia",
    privacyPolicyLabel: "Informativa Privacy (GDPR)",
    lockAdminLabel: "Area Riservata Esercente",
  },
};
