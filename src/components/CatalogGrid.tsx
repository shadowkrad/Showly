"use client";

import { useState } from "react";
import { ShowlyConfig } from "@/lib/config";
import { ProtectedModelImage } from "@/components/PhotoProtectionShield";

interface CatalogGridProps {
  config: ShowlyConfig;
  onOpenReserve: (itemTitle: string) => void;
  isMobilePreview?: boolean;
}

export default function CatalogGrid({
  config,
  onOpenReserve,
  isMobilePreview = false,
}: CatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tutti");

  const filteredItems = config.catalog.items.filter((item) => {
    if (item.visibilita === "CASSAFORTE" || item.visibilita === "NASCOSTO") {
      return false;
    }
    if (selectedCategory === "Tutti") return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const shouldShowPrice = (itemShowOverride?: boolean) => {
    if (itemShowOverride !== undefined) return itemShowOverride;
    return config.pricing.showPricesGlobally;
  };

  return (
    <section
      id="collezioni"
      className={`${
        isMobilePreview ? "py-10" : "py-14 sm:py-24"
      } border-b border-white/5 overflow-hidden`}
    >
      <div className={`max-w-7xl mx-auto ${isMobilePreview ? "px-4" : "px-4 sm:px-8"}`}>
        {/* Titolo e Categorie */}
        <div className={`text-center max-w-3xl mx-auto ${isMobilePreview ? "mb-8" : "mb-10 sm:mb-14"}`}>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-amber-400 uppercase font-mono mb-1.5 block">
            {config.catalog.tagLabel}
          </span>
          <h2
            className={`font-serif-luxury font-bold text-white tracking-tight ${
              isMobilePreview ? "text-2xl mb-5" : "text-2xl sm:text-5xl mb-6 sm:mb-8"
            }`}
          >
            {config.catalog.sectionTitle}
          </h2>

          {/* Filtro Categorie a Pillole */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5">
            {config.catalog.categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  isMobilePreview
                    ? "px-3.5 py-1.5 text-[10px]"
                    : "px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs"
                } ${
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
        <div
          className={`grid gap-5 sm:gap-8 ${
            isMobilePreview
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredItems.map((item) => {
            const isPriceVisible = shouldShowPrice(item.showPriceOverride);
            return (
              <div
                key={item.id}
                className="group bg-luxe-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-black/40 image-zoom-container">
                  <ProtectedModelImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{
                      objectPosition: `${item.posX ?? 50}% ${item.posY ?? 50}%`,
                      transform: `scale(${item.zoom ?? 1})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md bg-black/65 border border-white/15 text-amber-300">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-black/65 border border-white/15 text-white">
                      {isPriceVisible
                        ? item.price
                        : config.pricing.hiddenPriceFallbackText}
                    </span>
                  </div>
                </div>

                <div
                  className={`${
                    isMobilePreview ? "p-4" : "p-5 sm:p-6"
                  } flex-1 flex flex-col justify-between`}
                >
                  <div>
                    <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-luxe-sub font-light mb-4 sm:mb-5">
                      {item.specs}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenReserve(item.title)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white hover:text-black border border-white/10 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-1 cursor-pointer"
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
