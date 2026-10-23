"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Laptop,
  Save,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";
import Header from "@/components/Header";
import ShowGallery from "@/components/ShowGallery";
import CatalogGrid from "@/components/CatalogGrid";
import AtelierSection from "@/components/AtelierSection";
import Footer from "@/components/Footer";

export default function LiveShowcaseStudioPage() {
  const [config, setConfig] = useState<ShowlyConfig>(DEFAULT_SHOWLY_CONFIG);
  const [simulatorMode, setSimulatorMode] = useState<"mobile" | "desktop">("mobile");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
            <span>Editor Visivo Split-Screen</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-amber-500" />
            Live Showcase Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalizza ogni testo, prezzo, collezione e immagine della vetrina con anteprima istantanea.
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
        <div className="lg:col-span-5 space-y-5 max-h-[780px] overflow-y-auto pr-1">
          {/* 1. Politica Prezzi */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-wider">
                <span>💰 Politica Visibilità Prezzi</span>
              </div>
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
              <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* 2. Identità Brand & Hero */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
              1. Identità Brand &amp; Hero Still-Life
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome Bottega / Atelier
              </label>
              <input
                type="text"
                value={config.brand.name}
                onChange={(e) =>
                  setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Occhiello Hero
              </label>
              <input
                type="text"
                value={config.hero.tagText}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, tagText: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Titolo Principale Hero
              </label>
              <input
                type="text"
                value={config.hero.headline}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, headline: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                URL Immagine Hero
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

          {/* 3. ShowGallery */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">
                2. ShowGallery Stile Apple ({config.showgallery.slides.length})
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

            {config.showgallery.slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNA DESTRA: SIMULATORE LIVE */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-6 flex items-center justify-center overflow-hidden">
          <div
            className={`bg-luxe-black text-luxe-light overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full transition-all duration-300 shadow-2xl ${
              simulatorMode === "mobile"
                ? "w-full max-w-[390px] h-[720px] rounded-[42px] border-[8px] border-neutral-800"
                : "w-full h-[720px] rounded-2xl border border-white/15"
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
          </div>
        </div>
      </div>
    </div>
  );
}
