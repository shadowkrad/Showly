"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Laptop,
  Save,
  RefreshCw,
  Sparkles,
  Sliders,
  DollarSign,
  CheckCircle2,
  ExternalLink,
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      
      {/* Top Bar Studio */}
      <div className="h-16 bg-luxe-card border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Showcase Studio (Split-Screen)
            </h1>
            <p className="text-[10px] text-luxe-sub">Personalizza ogni aspetto visivo e testalo in tempo reale</p>
          </div>
        </div>

        {/* Switch Simulatore & Azioni */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setSimulatorMode("mobile")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                simulatorMode === "mobile"
                  ? "bg-amber-400 text-black shadow-sm font-bold"
                  : "text-luxe-sub hover:text-white"
              }`}
              title="Simulatore Smartphone 390px"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390px)</span>
            </button>
            <button
              onClick={() => setSimulatorMode("desktop")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                simulatorMode === "desktop"
                  ? "bg-amber-400 text-black shadow-sm font-bold"
                  : "text-luxe-sub hover:text-white"
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
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Salvataggio..." : "Salva Vetrina Live"}</span>
          </button>
        </div>
      </div>

      {/* Split-Screen: Sinistra Controlli (45%) | Destra Simulatore (55%) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANNELLO CONTROLLI SINISTRA */}
        <div className="w-full lg:w-[45%] border-r border-white/10 overflow-y-auto p-6 space-y-8 bg-[#0E1015]/90">
          
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Vetrina aggiornata e salvata con successo!</span>
            </div>
          )}

          {/* 1. Brand & Identità */}
          <section className="space-y-4 bg-luxe-card border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Identità & Brand</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  Nome Bottega / Marchio
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
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  Payoff / Descrizione Breve
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
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </section>

          {/* 2. Politica Prezzi (Flag Globale & Testo di Riserva) */}
          <section className="space-y-4 bg-luxe-card border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
              <DollarSign className="w-3.5 h-3.5" />
              <span>2. Politica Prezzi al Pubblico</span>
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
              <div>
                <span className="text-xs font-bold text-white block">Mostra Prezzi al Pubblico</span>
                <span className="text-[11px] text-luxe-sub">
                  Se disattivato, tutti i prezzi vengono nascosti nella vetrina.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    pricing: {
                      ...config.pricing,
                      showPricesGlobally: !config.pricing.showPricesGlobally,
                    },
                  })
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  config.pricing.showPricesGlobally
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/10 text-luxe-sub border border-white/15"
                }`}
              >
                {config.pricing.showPricesGlobally ? "VISIBILI (ON)" : "NASCOSTI (OFF)"}
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                Testo Alternativo Quando i Prezzi Sono Nascosti
              </label>
              <input
                type="text"
                value={config.pricing.hiddenPriceFallbackText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    pricing: {
                      ...config.pricing,
                      hiddenPriceFallbackText: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </section>

          {/* 3. Hero di Campagna */}
          <section className="space-y-4 bg-luxe-card border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              3. Hero di Campagna
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  Tag Sopratitolo
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
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  Titolo Principale (Supporta &lt;br/&gt;)
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
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  URL Foto Copertina (Alta Risoluzione)
                </label>
                <input
                  type="text"
                  value={config.hero.imageUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, imageUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </section>

          {/* 4. Orari & Bottega */}
          <section className="space-y-4 bg-luxe-card border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              4. Bottega & Orari
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  Indirizzo Bottega
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
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  Orario Feriale (Lun – Ven)
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
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-luxe-sub block mb-1">
                  Stato In Tempo Reale (Badge Verde)
                </label>
                <input
                  type="text"
                  value={config.atelier.statusLiveText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      atelier: { ...config.atelier, statusLiveText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </section>

        </div>

        {/* PANNELLO SIMULATORE DESTRA */}
        <div className="w-full lg:w-[55%] bg-[#08080A] flex items-center justify-center p-6 overflow-hidden relative">
          
          {simulatorMode === "mobile" ? (
            /* Simulatore Smartphone 390px */
            <div className="w-[390px] h-[780px] bg-black rounded-[48px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative scale-[0.88] 2xl:scale-100 transition-all">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-900 rounded-full z-50 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
              </div>

              {/* Contenuto scrollabile del telefono */}
              <div className="flex-1 overflow-y-auto no-scrollbar pt-6 bg-luxe-black">
                <Header config={config} onOpenReserve={() => {}} />
                
                {/* Hero Mobile */}
                <div className="relative min-h-[480px] flex items-end pb-12 px-5">
                  <img
                    src={config.hero.imageUrl}
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-luxe-black/30 to-black/20"></div>
                  <div className="relative z-10">
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-widest block mb-1">
                      {config.hero.tagText}
                    </span>
                    <h2
                      className="font-serif-luxury text-3xl font-bold text-white leading-tight"
                      dangerouslySetInnerHTML={{ __html: config.hero.headline }}
                    />
                  </div>
                </div>

                <ShowGallery config={config} onOpenReserve={() => {}} />
                <CatalogGrid config={config} onOpenReserve={() => {}} />
                <AtelierSection config={config} />
                <Footer config={config} />
              </div>
            </div>
          ) : (
            /* Simulatore Desktop Full */
            <div className="w-full h-full bg-luxe-black rounded-2xl border border-white/10 shadow-2xl overflow-y-auto no-scrollbar">
              <Header config={config} onOpenReserve={() => {}} />
              
              <div className="relative min-h-[600px] flex items-end pb-16 px-8">
                <img
                  src={config.hero.imageUrl}
                  alt="Hero"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-luxe-black/30 to-black/20"></div>
                <div className="relative z-10 max-w-2xl">
                  <span className="text-xs uppercase font-bold text-amber-300 tracking-widest block mb-1">
                    {config.hero.tagText}
                  </span>
                  <h2
                    className="font-serif-luxury text-5xl font-bold text-white leading-tight"
                    dangerouslySetInnerHTML={{ __html: config.hero.headline }}
                  />
                </div>
              </div>

              <ShowGallery config={config} onOpenReserve={() => {}} />
              <CatalogGrid config={config} onOpenReserve={() => {}} />
              <AtelierSection config={config} />
              <Footer config={config} />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
