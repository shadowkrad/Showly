"use client";

import { useState } from "react";
import { ShowlyConfig } from "@/lib/config";

interface CatalogGridProps {
  config: ShowlyConfig;
  onOpenReserve: (itemTitle: string) => void;
}

export default function CatalogGrid({ config, onOpenReserve }: CatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tutti");

  const filteredItems = config.catalog.items.filter((item) => {
    if (selectedCategory === "Tutti") return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const shouldShowPrice = (itemShowOverride?: boolean) => {
    if (itemShowOverride !== undefined) return itemShowOverride;
    return config.pricing.showPricesGlobally;
  };

  return (
    <section id="collezioni" className="py-20 sm:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Titolo e Categorie */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400 uppercase font-mono mb-2 block">
            {config.catalog.tagLabel}
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight mb-8">
            {config.catalog.sectionTitle}
          </h2>

          {/* Filtro Categorie a Pillole */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {config.catalog.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-white text-black shadow-lg scale-105"
                    : "bg-white/5 text-luxe-sub hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Griglia Creazioni */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => {
            const isPriceVisible = shouldShowPrice(item.showPriceOverride);
            return (
              <div
                key={item.id}
                className="group bg-luxe-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-black/40 image-zoom-container">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md bg-black/60 border border-white/15 text-amber-300">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-black/60 border border-white/15 text-white">
                      {isPriceVisible ? item.price : config.pricing.hiddenPriceFallbackText}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-luxe-sub font-light mb-5">
                      {item.specs}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenReserve(item.title)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white hover:text-black border border-white/10 text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Metti da Parte</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
