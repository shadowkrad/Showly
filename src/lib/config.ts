export interface ShowlyConfig {
  brand: {
    name: string;
    tagline: string;
    logoUrl?: string | null;
    accentColor: string;
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
      ctaText: string;
    }>;
  };
  catalog: {
    tagLabel: string;
    sectionTitle: string;
    categories: string[];
    items: Array<{
      id: string;
      title: string;
      category: string;
      specs: string;
      price: string;
      imageUrl: string;
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
  };
}

export const DEFAULT_SHOWLY_CONFIG: ShowlyConfig = {
  brand: {
    name: "Atelier Aurora",
    tagline: "Bottega Orafa & Manifattura d'Autore",
    accentColor: "#D4AF37",
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
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=90",
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
        imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90",
        ctaText: "Metti da Parte (24h) →",
      },
      {
        id: "slide-2",
        title: "Girocollo Catena Venezia",
        specs: "Oro Bianco e Brillante Punto Luce Taglio Cuore",
        price: "€ 820",
        imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=90",
        ctaText: "Metti da Parte (24h) →",
      },
      {
        id: "slide-3",
        title: "Bracciale Rigido Martellato",
        specs: "Oro Rosa Satinato • Finitura Artigianale a Mano",
        price: "€ 1.250",
        imageUrl: "https://images.unsplash.com/photo-1611591475155-4284ec289e61?auto=format&fit=crop&w=1200&q=90",
        ctaText: "Metti da Parte (24h) →",
      },
      {
        id: "slide-4",
        title: "Solitario Seta Pura",
        specs: "Platino 950 e Diamante Taglio Brillante 0.50ct",
        price: "€ 2.400",
        imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=90",
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
        title: "Fede Classica Bombata 4mm",
        category: "Anelli & Fedi",
        specs: "Oro Giallo 750‰",
        price: "€ 390",
        imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85",
      },
      {
        id: "cat-2",
        title: "Girocollo Seta con Pendente",
        category: "Collane",
        specs: "Oro Bianco 18kt",
        price: "€ 820",
        imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=85",
      },
      {
        id: "cat-3",
        title: "Bracciale Rigido Martellato",
        category: "Bracciali",
        specs: "Oro Rosa 750‰",
        price: "€ 1.250",
        imageUrl: "https://images.unsplash.com/photo-1611591475155-4284ec289e61?auto=format&fit=crop&w=800&q=85",
      },
      {
        id: "cat-4",
        title: "Solitario Seta Pura",
        category: "Anelli & Fedi",
        specs: "Platino & Diamante",
        price: "€ 2.400",
        imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=85",
      },
      {
        id: "cat-5",
        title: "Orecchini a Cerchio Ondulati",
        category: "Punti Luce",
        specs: "Oro Giallo Spazzolato",
        price: "€ 440",
        imageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85",
      },
      {
        id: "cat-6",
        title: "Veretta Diamanti Pavé",
        category: "Anelli & Fedi",
        specs: "Oro Bianco con 7 Diamanti",
        price: "€ 1.150",
        imageUrl: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=85",
      },
    ],
  },
  atelier: {
    tagLabel: "Bottega Storica • Tradizione dal 1984",
    heading: "La Cura del Dettaglio Fatto a Mano",
    photoUrl: "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&w=1200&q=85",
    sectionTitle: "Vieni a Trovarci in Bottega",
    description: "Ogni pezzo nasce nel nostro banco da lavoro ad Arezzo. Vieni a scoprire le nostre finiture dal vivo, provare i tuoi modelli preferiti o progettare una creazione su misura insieme a noi.",
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
    description: "Lo terremo riservato a tuo nome per 24 ore senza alcun impegno di acquisto. Riceverai un promemoria con le indicazioni per venire a provarlo.",
    submitButtonLabel: "Conferma Prenotazione Senza Impegno",
    successAlertMessage: "Creazione riservata con successo per 24 ore!",
    whatsappTemplateMessage: "Salve Atelier Aurora! Ho appena riservato la creazione {titoloPezzo} tramite la vetrina online per una prova in bottega.",
  },
  footer: {
    legalText: "Atelier Aurora S.r.l. • P.IVA 01928374652 • Arezzo, Italia",
    privacyPolicyLabel: "Informativa Privacy (GDPR)",
    lockAdminLabel: "Area Riservata Esercente",
  },
};
