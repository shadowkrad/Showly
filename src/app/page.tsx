"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ShowGallery from "@/components/ShowGallery";
import CatalogGrid from "@/components/CatalogGrid";
import AtelierSection from "@/components/AtelierSection";
import ReserveModal from "@/components/ReserveModal";
import Footer from "@/components/Footer";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";

export default function HomePage() {
  const [config, setConfig] = useState<ShowlyConfig>(DEFAULT_SHOWLY_CONFIG);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [selectedPieceTitle, setSelectedPieceTitle] = useState("Creazione in Vetrina");

  // Carica la configurazione dinamica aggiornata dall'esercente
  useEffect(() => {
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.brand) {
          setConfig(data);
        }
      })
      .catch(() => {
        // Usa default
      });
  }, []);

  const handleOpenReserve = (title?: string) => {
    setSelectedPieceTitle(title || config.showgallery.slides[0]?.title || "Creazione d'Autore");
    setReserveModalOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-luxe-black text-luxe-light selection:bg-amber-400 selection:text-black">
      {/* 1. Header Minimal Trasparente */}
      <Header config={config} onOpenReserve={handleOpenReserve} />

      {/* 2. Hero di Campagna a Tutto Campo */}
      <header className="relative w-full min-h-[75vh] sm:min-h-[85vh] flex items-end pb-16 sm:pb-24 overflow-hidden border-b border-white/5">
        <img
          src={config.hero.imageUrl}
          alt={config.brand.name}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-90 scale-100 hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-luxe-black/30 to-black/20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-amber-300/90 font-mono mb-2 block">
              {config.hero.tagText}
            </span>
            <h1
              className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]"
              dangerouslySetInnerHTML={{ __html: config.hero.headline }}
            />
          </div>

          <div>
            <a
              href="#showgallery"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center space-x-2 shadow-xl hover:scale-105"
            >
              <span>{config.hero.exploreButtonLabel}</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. ShowGallery a Scorrimento Stile Apple */}
      <ShowGallery config={config} onOpenReserve={handleOpenReserve} />

      {/* 4. Griglia Catalogo & Collezioni */}
      <CatalogGrid config={config} onOpenReserve={handleOpenReserve} />

      {/* 5. La Bottega, Orari Vivi & Mappa */}
      <AtelierSection config={config} />

      {/* 6. Footer con Lucchetto 🔒 */}
      <Footer config={config} />

      {/* Modale "Metti da Parte" (Click & Reserve 24h) */}
      <ReserveModal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        config={config}
        preselectedTitle={selectedPieceTitle}
      />
    </main>
  );
}
