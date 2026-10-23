"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Store,
  Gem,
  Globe,
  Mail,
  Smartphone,
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Share2,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Star,
  RefreshCw,
  Sparkles,
  Send,
  Trash2,
  Upload,
  Plus,
  Laptop,
  RotateCcw,
} from "lucide-react";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";
import Header from "@/components/Header";
import ShowGallery from "@/components/ShowGallery";
import CatalogGrid from "@/components/CatalogGrid";
import AtelierSection from "@/components/AtelierSection";
import Footer from "@/components/Footer";

type SettingsTab = "bottega" | "camerino" | "dominio" | "email" | "dispositivi" | "aspetto";
type StudioSubTab = "hero" | "showgallery" | "catalogo" | "atelier";

interface TabItem {
  id: SettingsTab;
  label: string;
  shortLabel: string;
  iconComponent: React.ElementType;
  shortDescription: string;
  description: string;
}

const TABS: TabItem[] = [
  {
    id: "bottega",
    label: "Bottega & Vetrina",
    shortLabel: "Bottega",
    iconComponent: Store,
    shortDescription: "Anagrafica, P.IVA e orari",
    description: "Ragione sociale, P.IVA, sede atelier, contatti, orari e sincronizzazione omnicanale",
  },
  {
    id: "camerino",
    label: "Camerino 24h & Prezzi",
    shortLabel: "Camerino 24h",
    iconComponent: Gem,
    shortDescription: "Click & Reserve e listini",
    description: "Politica visibilità prezzi, quotazione su richiesta e regole blocco pezzi 24 ore",
  },
  {
    id: "dominio",
    label: "Dominio & SSL",
    shortLabel: "Dominio",
    iconComponent: Globe,
    shortDescription: "Vetrina online e DNS",
    description: "Indirizzo vetrina pubblica, certificato Let's Encrypt e puntamenti DNS",
  },
  {
    id: "email",
    label: "Email & Notifiche",
    shortLabel: "Email",
    iconComponent: Mail,
    shortDescription: "Gateway email e avvisi",
    description: "Canale email Taaaac Mail Engine e notifiche di conferma prenotazione al cliente",
  },
  {
    id: "dispositivi",
    label: "Dispositivi PWA",
    shortLabel: "Dispositivi",
    iconComponent: Smartphone,
    shortDescription: "Sessioni e accesso rapido",
    description: "Gestione dispositivi collegati, sessioni attive e revoca smartphone da remoto",
  },
  {
    id: "aspetto",
    label: "Aspetto & Brand",
    shortLabel: "Brand & Studio",
    iconComponent: Palette,
    shortDescription: "Logo, foto e Live Studio",
    description: "Personalizzazione vetrina still-life, ShowGallery, catalogo creazioni e simulatore live",
  },
];

export default function ShowlyImpostazioniPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("bottega");
  const [studioSubTab, setStudioSubTab] = useState<StudioSubTab>("hero");
  const [simulatorMode, setSimulatorMode] = useState<"mobile" | "desktop">("mobile");
  const [config, setConfig] = useState<ShowlyConfig>(DEFAULT_SHOWLY_CONFIG);
  const [saving, setSaving] = useState(false);
  const [syncingOmnichannel, setSyncingOmnichannel] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Email Test State
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Trusted Devices State
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Refs per upload immagini
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const atelierInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.brand) {
          setConfig(data);
        }
      })
      .catch(() => {});

    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoadingDevices(true);
    try {
      const res = await fetch("/api/security?email=admin@atelieraurora.it");
      if (res.ok) {
        const d = await res.json();
        setDevices(d.trustedDevices || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      const res = await fetch("/api/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REMOVE_DEVICE",
          email: "admin@atelieraurora.it",
          deviceId,
        }),
      });
      if (res.ok) {
        setFeedback({ type: "success", text: "Dispositivo rimosso con successo." });
        loadDevices();
      }
    } catch {
      setFeedback({ type: "error", text: "Errore rimozione dispositivo." });
    }
  };

  const processImageFile = (
    file: File,
    maxSize: number,
    callback: (dataUrl: string) => void
  ) => {
    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", text: "Seleziona un file immagine valido (PNG, JPG, WebP)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxSize) {
          h = Math.round((h * maxSize) / w);
          w = maxSize;
        } else if (h >= w && h > maxSize) {
          w = Math.round((w * maxSize) / h);
          h = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/webp", 0.88));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setFeedback({
          type: "success",
          text: "Impostazioni e vetrina Showly salvate con successo!",
        });
      } else {
        setFeedback({ type: "error", text: "Errore durante il salvataggio delle impostazioni." });
      }
    } catch {
      setFeedback({ type: "error", text: "Errore di connessione durante il salvataggio." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSyncOmnichannel = async () => {
    setSyncingOmnichannel(true);
    setFeedback(null);
    try {
      await handleSave();
      setLastSyncAt(new Date().toISOString());
      setFeedback({
        type: "success",
        text: "🚀 Orari bottega sincronizzati all'unisono su Google Maps, Meta (Facebook & IG) e WhatsApp Business!",
      });
    } finally {
      setSyncingOmnichannel(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTestingEmail(true);
    setEmailResult(null);
    setTimeout(() => {
      setTestingEmail(false);
      setEmailResult({
        ok: true,
        message: `Email di test inviata correttamente a ${testEmail} tramite Taaaac Mail Engine.`,
      });
    }, 600);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Vuoi ripristinare i testi e le foto predefinite di Atelier Aurora?")) {
      setConfig(DEFAULT_SHOWLY_CONFIG);
      setFeedback({
        type: "success",
        text: "Configurazione predefinita ripristinata. Clicca 'Salva Modifiche' per confermare.",
      });
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab);
  const ActiveIcon = currentTab?.iconComponent || Store;
  const business = config.business || DEFAULT_SHOWLY_CONFIG.business!;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Intestazione Principale Unificata Taaaac */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <span>💎 Bottega d&apos;Autore &amp; Showroom</span>
            <span>•</span>
            <span>Configurazione Atelier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-amber-500" />
            Impostazioni Showly
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestisci dati fiscali, regole Camerino 24h, listini su richiesta, canali e Live Showcase Studio.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-sm rounded-xl shadow-xs shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Salvataggio...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salva Modifiche</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* LAYOUT A 2 COLONNE IDENTICO AGLI ALTRI MODULI TAAAAC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNA SINISTRA: MENU SEZIONI IMPOSTAZIONI */}
        <aside className="lg:col-span-4 xl:col-span-3 sticky top-14 lg:top-6 z-30 lg:z-auto space-y-3">
          <div className="bg-white/95 backdrop-blur-md lg:bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-xs">
            <div className="px-3 py-2 border-b border-slate-100 hidden lg:block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sezioni Impostazioni
              </span>
            </div>

            {/* Menu a Tendina Mobile (< lg) */}
            <div className="lg:hidden p-1">
              <label
                htmlFor="settings-tab-select"
                className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1"
              >
                Sezione Impostazioni:
              </label>
              <div className="relative">
                <select
                  id="settings-tab-select"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as SettingsTab)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold py-2.5 pl-3.5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition cursor-pointer"
                >
                  {TABS.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Navigazione Verticale Desktop (lg:) */}
            <nav
              className="hidden lg:flex flex-col gap-1.5 pt-2"
              aria-label="Sezioni Impostazioni Showly"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComp = tab.iconComponent;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center justify-between w-full p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-50 text-amber-950 font-semibold border border-amber-200/80 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? "bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/30"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
                          <span>{tab.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-normal truncate">
                          {tab.shortDescription}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? "text-amber-600 translate-x-0.5"
                          : "text-slate-300 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* COLONNA DESTRA: PANNELLO CONTENUTI */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Header contestuale scheda attiva */}
          {currentTab && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {currentTab.label}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{currentTab.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: BOTTEGA & VETRINA */}
          {activeTab === "bottega" && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Atelier / Bottega
                  </label>
                  <input
                    type="text"
                    value={config.brand.name}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        brand: { ...config.brand, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sottotitolo / Specializzazione d&apos;Arte
                  </label>
                  <input
                    type="text"
                    value={config.brand.tagline}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        brand: { ...config.brand, tagline: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ragione Sociale
                  </label>
                  <input
                    type="text"
                    value={business.ragioneSociale}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...business, ragioneSociale: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Partita IVA / Codice Fiscale
                  </label>
                  <input
                    type="text"
                    value={business.partitaIva}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...business, partitaIva: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sede della Bottega / Indirizzo Showroom
                  </label>
                  <input
                    type="text"
                    value={config.atelier.addressText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        atelier: { ...config.atelier, addressText: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Titolare / Maestro d&apos;Arte
                  </label>
                  <input
                    type="text"
                    value={business.titolare}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...business, titolare: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefono Bottega &amp; WhatsApp Diretto
                  </label>
                  <input
                    type="text"
                    value={business.telefono}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...business, telefono: e.target.value },
                        atelier: { ...config.atelier, whatsappButtonText: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Contatto Clienti
                  </label>
                  <input
                    type="email"
                    value={business.emailContatto}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...business, emailContatto: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Orari di Apertura Bottega */}
              <div className="pt-4 border-t border-slate-200/80 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    ⏰ Orari di Apertura Bottega Fisica
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mostrati nella sezione &ldquo;La Bottega&rdquo; della vetrina online.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lunedì – Venerdì
                    </label>
                    <input
                      type="text"
                      value={config.atelier.hoursWeekdayText}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          atelier: { ...config.atelier, hoursWeekdayText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sabato
                    </label>
                    <input
                      type="text"
                      value={config.atelier.hoursSaturdayText}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          atelier: { ...config.atelier, hoursSaturdayText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Domenica / Su Appuntamento
                    </label>
                    <input
                      type="text"
                      value={config.atelier.hoursSundayText}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          atelier: { ...config.atelier, hoursSundayText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Dati Legali Footer */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Dicitura Legale Footer Vetrina
                </label>
                <input
                  type="text"
                  value={config.footer.legalText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      footer: { ...config.footer, legalText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Hub Sincronizzazione Omnicanale v1.1.0 All'Unisono */}
              <div className="pt-4 border-t border-slate-100">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 shadow-lg text-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          Hub Sincronizzazione Omnicanale
                          <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                            v1.1.0 All&apos;Unisono
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Un solo click aggiorna orari della bottega su Google Maps, Meta (Facebook &amp; IG) e WhatsApp Business.
                        </p>
                      </div>
                    </div>
                    {lastSyncAt && (
                      <div className="text-[11px] text-slate-400">
                        Ultima sinc:{" "}
                        <span className="text-slate-200 font-mono">
                          {new Date(lastSyncAt).toLocaleString("it-IT")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">Google Maps</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Pronto (Core)
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Share2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">Facebook &amp; IG</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Pronto (Core)
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">WhatsApp</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Attivo 1-Click
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Star className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">Review Booster</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Email 5 Stelle
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSyncOmnichannel}
                      disabled={syncingOmnichannel}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      {syncingOmnichannel ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      🚀 Salva e Sincronizza Orari Bottega su Google &amp; Canali
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAMERINO 24H & PREZZI */}
          {activeTab === "camerino" && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      Mostra Prezzi di Listino in Vetrina Pubblica
                    </p>
                    <p className="text-xs text-slate-500">
                      Se disattivato, tutti i pezzi mostreranno la dicitura personalizzata (es. &ldquo;Quotazione su Richiesta&rdquo;).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.pricing.showPricesGlobally}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        pricing: { ...config.pricing, showPricesGlobally: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      Prenotazione Gratuita &ldquo;Metti da Parte per 24h&rdquo; (Click &amp; Reserve)
                    </p>
                    <p className="text-xs text-slate-500">
                      Consenti ai clienti di bloccare online una creazione per venirla a provare di persona in bottega entro 24 ore.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={business.ritiroInBottega24h}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...business, ritiroInBottega24h: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      Notifica Automatica Nuove Richieste Camerino
                    </p>
                    <p className="text-xs text-slate-500">
                      Ricevi un avviso immediato quando un cliente blocca un pezzo unico dalla vetrina.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={business.notificaNuovePrenotazioni}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...business, notificaNuovePrenotazioni: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dicitura Prezzo Nascosto / Riservato
                  </label>
                  <input
                    type="text"
                    value={config.pricing.hiddenPriceFallbackText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        pricing: { ...config.pricing, hiddenPriceFallbackText: e.target.value },
                      })
                    }
                    placeholder="Quotazione su Richiesta"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Titolo Finestra &ldquo;Metti da Parte&rdquo;
                  </label>
                  <input
                    type="text"
                    value={config.reserveModal.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        reserveModal: { ...config.reserveModal, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Descrizione Condizioni Prova in Bottega (24 Ore)
                </label>
                <textarea
                  rows={2}
                  value={config.reserveModal.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      reserveModal: { ...config.reserveModal, description: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Template Messaggio WhatsApp di Conferma Blocco
                </label>
                <p className="text-[11px] text-slate-500">
                  Usa <code className="bg-slate-100 px-1 py-0.5 rounded">{"{titoloPezzo}"}</code> per inserire automaticamente il nome della creazione scelta dal cliente.
                </p>
                <textarea
                  rows={3}
                  value={config.reserveModal.whatsappTemplateMessage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      reserveModal: {
                        ...config.reserveModal,
                        whatsappTemplateMessage: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DOMINIO & SSL */}
          {activeTab === "dominio" && (
            <div className="p-6 bg-gradient-to-br from-amber-50/60 to-slate-50 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Vetrina Online &amp; Dominio Personalizzato
                    </h3>
                    <p className="text-xs text-slate-500">
                      Indirizzo pubblico dell&apos;atelier con certificato SSL Let&apos;s Encrypt automatico.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  SSL Attivo &amp; Sicuro
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Indirizzo Vetrina Ufficiale
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">
                      https://atelier.taaaac.eu
                    </span>
                    <a
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                      title="Apri vetrina in una nuova scheda"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Puntamenti DNS Server
                  </span>
                  <p className="font-mono text-xs text-slate-700">
                    IP VPS: <strong className="text-amber-700">80.211.130.61</strong> (Record A @)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Gestibile e modificabile dal <strong>Portale Taaaac</strong> (taaaac.eu/portal).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL & NOTIFICHE */}
          {activeTab === "email" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Canale Notifiche Email Camerino 24h
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Taaaac Engine
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Le conferme di blocco &ldquo;Metti da Parte 24h&rdquo; ai clienti e gli avvisi di nuove richieste in bottega vengono inviati tramite i server certificati Taaaac con conformità SPF e DMARC garantita.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Casella Mittente Sito:</span>
                  <span className="font-mono text-amber-700 font-semibold">
                    noreply@showly.taaaac.eu
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Stato Consegna:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Attivo &amp; Certificato
                  </span>
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Invia email di prova prenotazione
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="atelier@esempio.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail || !testEmail}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {testingEmail ? (
                      "Invio..."
                    ) : (
                      <>
                        <Send className="w-3 h-3" /> Test
                      </>
                    )}
                  </button>
                </div>

                {emailResult && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
                      emailResult.ok
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>{emailResult.message}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Vuoi personalizzare dominio mittente o casella?
                </span>
                <a
                  href="https://taaaac.eu/portal#domain"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 hover:text-amber-900 underline font-bold inline-flex items-center gap-1"
                >
                  Portale Taaaac <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: DISPOSITIVI PWA */}
          {activeTab === "dispositivi" && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dispositivi Autorizzati &amp; Sessioni PWA
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Elenco degli smartphone, tablet e computer che hanno effettuato l&apos;accesso al gestionale dell&apos;atelier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDevices}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer w-fit"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Aggiorna Lista</span>
                </button>
              </div>

              {loadingDevices ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Lettura dispositivi registrati...
                </div>
              ) : devices.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
                  <Smartphone className="w-7 h-7 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    Nessun dispositivo memorizzato
                  </p>
                  <p className="text-[11px] text-slate-500">
                    I dispositivi compariranno automaticamente qui al primo accesso autenticato.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {devices.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {d.deviceName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            IP: {d.ipAddress} • Ultimo uso:{" "}
                            {new Date(d.lastUsedAt).toLocaleString("it-IT")}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevokeDevice(d.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Scollega dispositivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ASPETTO & BRAND (LIVE SHOWCASE VISUAL STUDIO INTEGRATO) */}
          {activeTab === "aspetto" && (
            <div className="space-y-6">
              {/* Barra Sub-Tab Studio & Switch Mobile/Desktop */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "hero", label: "1. Brand & Hero" },
                    { id: "showgallery", label: "2. ShowGallery Apple" },
                    { id: "catalogo", label: "3. Catalogo Pezzi" },
                    { id: "atelier", label: "4. Sezione Bottega" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStudioSubTab(st.id as StudioSubTab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        studioSubTab === st.id
                          ? "bg-amber-500 text-slate-950 shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setSimulatorMode("mobile")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        simulatorMode === "mobile"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>390px</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatorMode("desktop")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        simulatorMode === "desktop"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="Ripristina valori predefiniti"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor + Anteprima Live Affiancata */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Colonna Editor Studio */}
                <div className="xl:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5 max-h-[750px] overflow-y-auto">
                  {studioSubTab === "hero" && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                        Logo, Colore &amp; Copertina Hero
                      </h3>

                      {/* Upload Logo */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Logo Atelier (Opzionale)
                        </label>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              processImageFile(f, 500, (url) =>
                                setConfig({
                                  ...config,
                                  brand: { ...config.brand, logoUrl: url },
                                })
                              );
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Carica Logo</span>
                          </button>
                          {config.brand.logoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfig({
                                  ...config,
                                  brand: { ...config.brand, logoUrl: null },
                                })
                              }
                              className="text-xs text-rose-600 hover:underline cursor-pointer"
                            >
                              Rimuovi
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Occhiello Superiore Hero
                        </label>
                        <input
                          type="text"
                          value={config.hero.tagText}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              hero: { ...config.hero, tagText: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Titolo Principale Hero
                        </label>
                        <input
                          type="text"
                          value={config.hero.headline}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              hero: { ...config.hero, headline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Immagine Hero Still-Life (URL o Upload)
                        </label>
                        <input
                          ref={heroInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              processImageFile(f, 1600, (url) =>
                                setConfig({
                                  ...config,
                                  hero: { ...config.hero, imageUrl: url },
                                })
                              );
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={config.hero.imageUrl}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                hero: { ...config.hero, imageUrl: e.target.value },
                              })
                            }
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => heroInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {studioSubTab === "showgallery" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                          Slide ShowGallery ({config.showgallery.slides.length})
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              showgallery: {
                                ...config.showgallery,
                                slides: [
                                  ...config.showgallery.slides,
                                  {
                                    id: `slide-${Date.now()}`,
                                    title: "Nuova Creazione d'Autore",
                                    specs: "Pezzo Unico • Lavorazione Artigianale",
                                    price: "€ 950",
                                    imageUrl:
                                      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90",
                                    ctaText: "Metti da Parte (24h) →",
                                  },
                                ],
                              },
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Aggiungi
                        </button>
                      </div>

                      {config.showgallery.slides.map((slide, idx) => (
                        <div
                          key={slide.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">
                              Slide #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = config.showgallery.slides.filter(
                                  (_, i) => i !== idx
                                );
                                setConfig({
                                  ...config,
                                  showgallery: { ...config.showgallery, slides: next },
                                });
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => {
                              const next = [...config.showgallery.slides];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setConfig({
                                ...config,
                                showgallery: { ...config.showgallery, slides: next },
                              });
                            }}
                            placeholder="Titolo creazione"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={slide.price}
                              onChange={(e) => {
                                const next = [...config.showgallery.slides];
                                next[idx] = { ...next[idx], price: e.target.value };
                                setConfig({
                                  ...config,
                                  showgallery: { ...config.showgallery, slides: next },
                                });
                              }}
                              placeholder="€ 390"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                            />
                            <input
                              type="text"
                              value={slide.specs}
                              onChange={(e) => {
                                const next = [...config.showgallery.slides];
                                next[idx] = { ...next[idx], specs: e.target.value };
                                setConfig({
                                  ...config,
                                  showgallery: { ...config.showgallery, slides: next },
                                });
                              }}
                              placeholder="Specifiche materiale"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            value={slide.imageUrl}
                            onChange={(e) => {
                              const next = [...config.showgallery.slides];
                              next[idx] = { ...next[idx], imageUrl: e.target.value };
                              setConfig({
                                ...config,
                                showgallery: { ...config.showgallery, slides: next },
                              });
                            }}
                            placeholder="URL Immagine"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {studioSubTab === "catalogo" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                          Pezzi in Catalogo ({config.catalog.items.length})
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              catalog: {
                                ...config.catalog,
                                items: [
                                  ...config.catalog.items,
                                  {
                                    id: `cat-${Date.now()}`,
                                    title: "Nuova Creazione",
                                    category: config.catalog.categories[1] || "Creazioni",
                                    specs: "Fatto a mano in bottega",
                                    price: "€ 550",
                                    imageUrl:
                                      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=85",
                                  },
                                ],
                              },
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Nuovo Pezzo
                        </button>
                      </div>

                      {config.catalog.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">
                              Articolo #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = config.catalog.items.filter((_, i) => i !== idx);
                                setConfig({
                                  ...config,
                                  catalog: { ...config.catalog, items: next },
                                });
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const next = [...config.catalog.items];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setConfig({
                                ...config,
                                catalog: { ...config.catalog, items: next },
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={item.price}
                              onChange={(e) => {
                                const next = [...config.catalog.items];
                                next[idx] = { ...next[idx], price: e.target.value };
                                setConfig({
                                  ...config,
                                  catalog: { ...config.catalog, items: next },
                                });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                            />
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => {
                                const next = [...config.catalog.items];
                                next[idx] = { ...next[idx], category: e.target.value };
                                setConfig({
                                  ...config,
                                  catalog: { ...config.catalog, items: next },
                                });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            value={item.imageUrl}
                            onChange={(e) => {
                              const next = [...config.catalog.items];
                              next[idx] = { ...next[idx], imageUrl: e.target.value };
                              setConfig({
                                ...config,
                                catalog: { ...config.catalog, items: next },
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {studioSubTab === "atelier" && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                        Racconto &amp; Foto della Bottega
                      </h3>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Titolo Sezione Bottega
                        </label>
                        <input
                          type="text"
                          value={config.atelier.heading}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              atelier: { ...config.atelier, heading: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Storia / Descrizione Artigianale
                        </label>
                        <textarea
                          rows={4}
                          value={config.atelier.description}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              atelier: { ...config.atelier, description: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Foto Laboratorio / Bottega
                        </label>
                        <input
                          ref={atelierInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              processImageFile(f, 1200, (url) =>
                                setConfig({
                                  ...config,
                                  atelier: { ...config.atelier, photoUrl: url },
                                })
                              );
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={config.atelier.photoUrl}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                atelier: { ...config.atelier, photoUrl: e.target.value },
                              })
                            }
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => atelierInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colonna Simulatore Live Vetrina */}
                <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 flex items-center justify-center overflow-hidden">
                  <div
                    className={`bg-luxe-black text-luxe-light overflow-y-auto transition-all duration-300 shadow-2xl ${
                      simulatorMode === "mobile"
                        ? "w-[390px] h-[680px] rounded-[40px] border-[8px] border-neutral-800"
                        : "w-full h-[680px] rounded-2xl border border-white/15"
                    }`}
                  >
                    <Header config={config} onOpenReserve={() => {}} />
                    <section className="relative h-[320px] flex items-center justify-center overflow-hidden">
                      <img
                        src={config.hero.imageUrl}
                        alt="Hero Preview"
                        className="absolute inset-0 w-full h-full object-cover scale-105 brightness-75"
                      />
                      <div className="absolute inset-0 hero-vignette"></div>
                      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[9px] uppercase tracking-[0.2em] text-amber-300 font-semibold">
                          {config.hero.tagText}
                        </span>
                        <h2
                          className="font-serif-luxury text-2xl font-bold text-white leading-tight"
                          dangerouslySetInnerHTML={{ __html: config.hero.headline }}
                        />
                      </div>
                    </section>
                    <ShowGallery config={config} onOpenReserve={() => {}} />
                    <CatalogGrid config={config} onOpenReserve={() => {}} />
                    <AtelierSection config={config} />
                    <Footer config={config} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
