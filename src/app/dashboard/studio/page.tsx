"use client";

import { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  Laptop,
  Save,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Store,
  Building2,
  Layers,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";
import Header from "@/components/Header";
import ShowGallery from "@/components/ShowGallery";
import CatalogGrid from "@/components/CatalogGrid";
import AtelierSection from "@/components/AtelierSection";
import Footer from "@/components/Footer";
import FloatingWhatsAppWidget from "@/components/FloatingWhatsAppWidget";

type StudioTab = "brand" | "showgallery" | "atelier" | "business" | "catalogo" | "footer";

export default function LiveShowcaseStudioPage() {
  const [config, setConfig] = useState<ShowlyConfig>(DEFAULT_SHOWLY_CONFIG);
  const [activeTab, setActiveTab] = useState<StudioTab>("brand");
  const [simulatorMode, setSimulatorMode] = useState<"mobile" | "desktop">("mobile");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const atelierPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const processImageFile = (
    file: File,
    maxDimension: number,
    mimeType: "image/webp" | "image/png",
    callback: (dataUrl: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL(mimeType, 0.9));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.brand) {
          setConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Errore durante il salvataggio della configurazione");
      }
    } catch {
      alert("Errore di rete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intestazione Principale Standard Taaaac */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <span>💎 Bottega d&apos;Autore &amp; Showroom</span>
            <span>•</span>
            <span>Editor Visivo Vetrina 100% Editabile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-amber-500" />
            Live Showcase Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalizza ogni sezione, testo, orari, contatti, bottega e gallery con anteprima fedele in tempo reale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setSimulatorMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulatorMode === "mobile"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Simulatore Smartphone 390px"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390px)</span>
            </button>
            <button
              onClick={() => setSimulatorMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulatorMode === "desktop"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Simulatore Desktop Esteso"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Desktop Full</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Salvataggio..." : "Salva Vetrina Live"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Modifiche salvate e pubblicate con successo sulla vetrina live!</span>
        </div>
      )}

      {/* Split-Screen: Sinistra Controlli (5/12) | Destra Simulatore (7/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNA SINISTRA: CONTROLLI */}
        <div className="lg:col-span-5 space-y-4 max-h-[820px] overflow-y-auto pr-1">
          {/* Selettore Schede Controllo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap gap-1 shadow-xs">
            {[
              { id: "brand", label: "Insegna & Hero", icon: Sparkles },
              { id: "showgallery", label: "ShowGallery", icon: Layers },
              { id: "atelier", label: "La Bottega", icon: Store },
              { id: "business", label: "Fisco & Dati", icon: Building2 },
              { id: "catalogo", label: "Catalogo & Bar", icon: Compass },
              { id: "footer", label: "Footer & Club", icon: FileText },
            ].map((tab) => {
              const IconC = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as StudioTab)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <IconC className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SCHEDA 1: BRAND, POLITICA PREZZI & HERO */}
          {activeTab === "brand" && (
            <div className="space-y-4">
              {/* Politica Prezzi */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600">
                    💰 Visibilità Prezzi Pubblici
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
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
                  </label>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Testo Fallback se Prezzo Nascosto
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Identità Brand & Hero */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                  Insegna Atelier &amp; Hero
                </h3>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nome Bottega / Atelier
                  </label>
                  <input
                    type="text"
                    value={config.brand.name}
                    onChange={(e) =>
                      setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tagline / Sottotitolo Insegna
                  </label>
                  <input
                    type="text"
                    value={config.brand.tagline}
                    onChange={(e) =>
                      setConfig({ ...config, brand: { ...config.brand, tagline: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                {/* LOGO AZIENDALE E FAVICON PWA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  {/* LOGO */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Logo Ufficiale
                      </label>
                      {config.brand.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, brand: { ...config.brand, logoUrl: null } })}
                          className="text-[10px] text-rose-600 hover:underline font-semibold"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, 512, "image/webp", (dataUrl) => {
                            setConfig((prev) => ({ ...prev, brand: { ...prev.brand, logoUrl: dataUrl } }));
                          });
                        }
                      }}
                    />
                    {config.brand.logoUrl ? (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center p-1 border border-slate-200 shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={config.brand.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="text-[11px] text-amber-700 font-bold hover:underline"
                        >
                          Cambia
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-2.5 text-center bg-white text-xs font-semibold"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-600 mx-auto mb-1" />
                        Carica Logo
                      </button>
                    )}
                  </div>

                  {/* FAVICON */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Favicon / Icona App
                      </label>
                      {config.brand.faviconUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, brand: { ...config.brand, faviconUrl: null } })}
                          className="text-[10px] text-rose-600 hover:underline font-semibold"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={faviconInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, 128, "image/png", (dataUrl) => {
                            setConfig((prev) => ({ ...prev, brand: { ...prev.brand, faviconUrl: dataUrl } }));
                          });
                        }
                      }}
                    />
                    {config.brand.faviconUrl ? (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center p-1 border border-slate-200 shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={config.brand.faviconUrl} alt="Favicon" className="max-w-full max-h-full object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current?.click()}
                          className="text-[11px] text-amber-700 font-bold hover:underline"
                        >
                          Cambia
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-2.5 text-center bg-white text-xs font-semibold"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-600 mx-auto mb-1" />
                        Carica Icona
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Occhiello Superiore Hero
                  </label>
                  <input
                    type="text"
                    value={config.hero.tagText}
                    onChange={(e) =>
                      setConfig({ ...config, hero: { ...config.hero, tagText: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Titolo Principale Hero
                  </label>
                  <input
                    type="text"
                    value={config.hero.headline}
                    onChange={(e) =>
                      setConfig({ ...config, hero: { ...config.hero, headline: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    URL Immagine Copertina Hero
                  </label>
                  <input
                    type="text"
                    value={config.hero.imageUrl}
                    onChange={(e) =>
                      setConfig({ ...config, hero: { ...config.hero, imageUrl: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCHEDA 2: SHOWGALLERY */}
          {activeTab === "showgallery" && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                    ShowGallery Iconici ({config.showgallery.slides.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">I pezzi più prestigiosi presentati a tutto schermo.</p>
                </div>
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
                            title: "Nuovo Pezzo Iconico",
                            specs: "Manifattura Artigianale",
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

              <div className="space-y-3">
                {config.showgallery.slides.map((slide, idx) => (
                  <div key={slide.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Slide #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = config.showgallery.slides.filter((_, i) => i !== idx);
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
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Titolo</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const next = [...config.showgallery.slides];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setConfig({ ...config, showgallery: { ...config.showgallery, slides: next } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Prezzo</label>
                        <input
                          type="text"
                          value={slide.price}
                          onChange={(e) => {
                            const next = [...config.showgallery.slides];
                            next[idx] = { ...next[idx], price: e.target.value };
                            setConfig({ ...config, showgallery: { ...config.showgallery, slides: next } });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Specifiche</label>
                        <input
                          type="text"
                          value={slide.specs}
                          onChange={(e) => {
                            const next = [...config.showgallery.slides];
                            next[idx] = { ...next[idx], specs: e.target.value };
                            setConfig({ ...config, showgallery: { ...config.showgallery, slides: next } });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">URL Immagine</label>
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={(e) => {
                          const next = [...config.showgallery.slides];
                          next[idx] = { ...next[idx], imageUrl: e.target.value };
                          setConfig({ ...config, showgallery: { ...config.showgallery, slides: next } });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCHEDA 3: LA BOTTEGA / ATELIER */}
          {activeTab === "atelier" && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-500" />
                  <span>La Bottega &amp; Orari di Ricezione</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Personalizza indirizzo, orari di apertura, foto del banchetto e stato live della bottega.
                </p>
              </div>

              {/* Foto Bottega */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">Foto del Banchetto / Bottega</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.atelier.photoUrl}
                    onChange={(e) =>
                      setConfig({ ...config, atelier: { ...config.atelier, photoUrl: e.target.value } })
                    }
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  <input
                    type="file"
                    ref={atelierPhotoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        processImageFile(file, 1200, "image/webp", (dataUrl) => {
                          setConfig((prev) => ({
                            ...prev,
                            atelier: { ...prev.atelier, photoUrl: dataUrl },
                          }));
                        });
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => atelierPhotoInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carica</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Occhiello Sezione</label>
                  <input
                    type="text"
                    value={config.atelier.tagLabel}
                    onChange={(e) =>
                      setConfig({ ...config, atelier: { ...config.atelier, tagLabel: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Badge Stato Live</label>
                  <input
                    type="text"
                    value={config.atelier.statusLiveText}
                    onChange={(e) =>
                      setConfig({ ...config, atelier: { ...config.atelier, statusLiveText: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Titolo Sezione Bottega</label>
                <input
                  type="text"
                  value={config.atelier.heading}
                  onChange={(e) =>
                    setConfig({ ...config, atelier: { ...config.atelier, heading: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Descrizione &amp; Filosofia</label>
                <textarea
                  rows={3}
                  value={config.atelier.description}
                  onChange={(e) =>
                    setConfig({ ...config, atelier: { ...config.atelier, description: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              {/* Indirizzo e Mappe */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Posizione &amp; Indicazioni</span>
                </h4>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Indirizzo Completo Bottega</label>
                  <input
                    type="text"
                    value={config.atelier.addressText}
                    onChange={(e) =>
                      setConfig({ ...config, atelier: { ...config.atelier, addressText: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Testo Pulsante Mappe</label>
                  <input
                    type="text"
                    value={config.atelier.directionsButtonText}
                    onChange={(e) =>
                      setConfig({ ...config, atelier: { ...config.atelier, directionsButtonText: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Orari di Ricezione */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Orari di Ricezione &amp; Appuntamenti</span>
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Feriali (Lunedì - Venerdì)</label>
                    <input
                      type="text"
                      value={config.atelier.hoursWeekdayText}
                      onChange={(e) =>
                        setConfig({ ...config, atelier: { ...config.atelier, hoursWeekdayText: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Sabato</label>
                    <input
                      type="text"
                      value={config.atelier.hoursSaturdayText}
                      onChange={(e) =>
                        setConfig({ ...config, atelier: { ...config.atelier, hoursSaturdayText: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Domenica / Festivi</label>
                    <input
                      type="text"
                      value={config.atelier.hoursSundayText}
                      onChange={(e) =>
                        setConfig({ ...config, atelier: { ...config.atelier, hoursSundayText: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Bottega */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Numero WhatsApp Bottega / Assistenza</span>
                </label>
                <input
                  type="text"
                  value={config.atelier.whatsappButtonText}
                  onChange={(e) =>
                    setConfig({ ...config, atelier: { ...config.atelier, whatsappButtonText: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* SCHEDA 4: DATI AZIENDALI & FISCALI */}
          {activeTab === "business" && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>Dati Aziendali &amp; Recapiti Ufficiali</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  I dati societari ufficiali per conformità legale, comunicazioni e ricevute.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Ragione Sociale</label>
                <input
                  type="text"
                  value={config.business?.ragioneSociale ?? ""}
                  placeholder="es. Atelier Aurora S.r.l."
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      business: { ...(config.business || { partitaIva: "", titolare: "", emailContatto: "", telefono: "", ritiroInBottega24h: true, notificaNuovePrenotazioni: true, ragioneSociale: "" }), ragioneSociale: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Partita IVA / Codice Fiscale</label>
                  <input
                    type="text"
                    value={config.business?.partitaIva ?? ""}
                    placeholder="01234567890"
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...(config.business || { ragioneSociale: "", titolare: "", emailContatto: "", telefono: "", ritiroInBottega24h: true, notificaNuovePrenotazioni: true, partitaIva: "" }), partitaIva: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Titolare / Maestro Orafo</label>
                  <input
                    type="text"
                    value={config.business?.titolare ?? ""}
                    placeholder="Nome Titolare"
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...(config.business || { ragioneSociale: "", partitaIva: "", emailContatto: "", telefono: "", ritiroInBottega24h: true, notificaNuovePrenotazioni: true, titolare: "" }), titolare: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Email di Contatto</label>
                  <input
                    type="email"
                    value={config.business?.emailContatto ?? ""}
                    placeholder="info@atelier.it"
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...(config.business || { ragioneSociale: "", partitaIva: "", titolare: "", telefono: "", ritiroInBottega24h: true, notificaNuovePrenotazioni: true, emailContatto: "" }), emailContatto: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Telefono Principale</label>
                  <input
                    type="text"
                    value={config.business?.telefono ?? ""}
                    placeholder="+39 0575 000000"
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        business: { ...(config.business || { ragioneSociale: "", partitaIva: "", titolare: "", emailContatto: "", ritiroInBottega24h: true, notificaNuovePrenotazioni: true, telefono: "" }), telefono: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCHEDA 5: CATALOGO & BARRA DI NAVIGAZIONE */}
          {activeTab === "catalogo" && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-500" />
                  <span>Titoli Catalogo &amp; Barra di Navigazione</span>
                </h3>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Sezione Catalogo Vetrina</h4>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Occhiello Catalogo</label>
                  <input
                    type="text"
                    value={config.catalog.tagLabel}
                    onChange={(e) =>
                      setConfig({ ...config, catalog: { ...config.catalog, tagLabel: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Titolo Sezione Catalogo</label>
                  <input
                    type="text"
                    value={config.catalog.sectionTitle}
                    onChange={(e) =>
                      setConfig({ ...config, catalog: { ...config.catalog, sectionTitle: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Etichette Barra di Navigazione Header</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Link In Evidenza</label>
                    <input
                      type="text"
                      value={config.navigation.highlightLabel}
                      onChange={(e) =>
                        setConfig({ ...config, navigation: { ...config.navigation, highlightLabel: e.target.value } })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Link Collezioni</label>
                    <input
                      type="text"
                      value={config.navigation.collectionsLabel}
                      onChange={(e) =>
                        setConfig({ ...config, navigation: { ...config.navigation, collectionsLabel: e.target.value } })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Link La Bottega</label>
                    <input
                      type="text"
                      value={config.navigation.atelierLabel}
                      onChange={(e) =>
                        setConfig({ ...config, navigation: { ...config.navigation, atelierLabel: e.target.value } })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Pulsante CTA Principale</label>
                    <input
                      type="text"
                      value={config.navigation.ctaButtonLabel}
                      onChange={(e) =>
                        setConfig({ ...config, navigation: { ...config.navigation, ctaButtonLabel: e.target.value } })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDA 6: FOOTER, CLUB PRIVATO & PRIVACY */}
          {activeTab === "footer" && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Footer, Club Privato &amp; Note Legali</span>
                </h3>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Box Newsletter &amp; Club Privato</h4>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Badge Occhiello Newsletter</label>
                  <input
                    type="text"
                    value={config.footer.newsletterBadgeText ?? "Club Privato & Newsletter"}
                    onChange={(e) =>
                      setConfig({ ...config, footer: { ...config.footer, newsletterBadgeText: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Titolo Invito Esclusivo</label>
                  <input
                    type="text"
                    value={config.footer.newsletterTitle ?? "Selezioni Riservate & Inviti Esclusivi"}
                    onChange={(e) =>
                      setConfig({ ...config, footer: { ...config.footer, newsletterTitle: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Sottotitolo / Descrizione Newsletter</label>
                  <textarea
                    rows={2}
                    value={config.footer.newsletterSubtitle ?? "Ricevi in anteprima le nuove collezioni d'autore, gli inviti agli eventi e l'accesso prioritario alla nostra Cassaforte Privata."}
                    onChange={(e) =>
                      setConfig({ ...config, footer: { ...config.footer, newsletterSubtitle: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Note Legali &amp; Privacy</h4>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Dicitura Copyright &amp; P.IVA</label>
                  <input
                    type="text"
                    value={config.footer.legalText}
                    onChange={(e) =>
                      setConfig({ ...config, footer: { ...config.footer, legalText: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Etichetta Privacy Policy</label>
                  <input
                    type="text"
                    value={config.footer.privacyPolicyLabel}
                    onChange={(e) =>
                      setConfig({ ...config, footer: { ...config.footer, privacyPolicyLabel: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLONNA DESTRA: SIMULATORE LIVE */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-6 flex items-center justify-center overflow-hidden">
          <div
            className={`bg-luxe-black text-luxe-light overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full transition-all duration-300 shadow-2xl ${
              simulatorMode === "mobile"
                ? "w-full max-w-[390px] h-[780px] rounded-[42px] border-[8px] border-neutral-800"
                : "w-full h-[780px] rounded-2xl border border-white/15"
            }`}
          >
            <Header
              config={config}
              onOpenReserve={() => {}}
              isMobilePreview={simulatorMode === "mobile"}
            />
            <section
              className={`relative ${
                simulatorMode === "mobile" ? "h-[250px]" : "h-[340px]"
              } flex items-center justify-center overflow-hidden border-b border-white/5`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.hero.imageUrl}
                alt="Hero Preview"
                className="absolute inset-0 w-full h-full object-cover scale-105 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-black/40 to-black/30"></div>
              <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-2.5">
                <span className="inline-block px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[9px] uppercase tracking-[0.18em] text-amber-300 font-semibold leading-snug">
                  {config.hero.tagText}
                </span>
                <h2
                  className={`font-serif-luxury ${
                    simulatorMode === "mobile" ? "text-xl" : "text-2xl sm:text-3xl"
                  } font-bold text-white leading-tight`}
                  dangerouslySetInnerHTML={{ __html: config.hero.headline }}
                />
              </div>
            </section>
            <ShowGallery
              config={config}
              onOpenReserve={() => {}}
              isMobilePreview={simulatorMode === "mobile"}
            />
            <CatalogGrid
              config={config}
              onOpenReserve={() => {}}
              isMobilePreview={simulatorMode === "mobile"}
            />
            <AtelierSection
              config={config}
              isMobilePreview={simulatorMode === "mobile"}
            />
            <Footer
              config={config}
              isMobilePreview={simulatorMode === "mobile"}
            />
            <FloatingWhatsAppWidget
              phone={config.atelier.whatsappButtonText}
              brandName={config.brand.name}
              inSimulator={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
