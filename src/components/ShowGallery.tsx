"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ShowlyConfig } from "@/lib/config";

interface ShowGalleryProps {
  config: ShowlyConfig;
  onOpenReserve: (itemTitle: string) => void;
}

export default function ShowGallery({ config, onOpenReserve }: ShowGalleryProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);

    const cardWidth = 380;
    const current = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(current, 0), config.showgallery.slides.length - 1));
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [config.showgallery.slides]);

  const scrollByAmount = (amount: number) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const shouldShowPrice = (slideShowOverride?: boolean) => {
    if (slideShowOverride !== undefined) return slideShowOverride;
    return config.pricing.showPricesGlobally;
  };

  return (
    <section id="showgallery" className="py-20 sm:py-28 border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Titolo Sezione */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400 uppercase font-mono mb-2 block">
              {config.showgallery.tagLabel}
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight">
              {config.showgallery.sectionTitle}
            </h2>
          </div>

          {/* Frecce di Scorrimento Desktop */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => scrollByAmount(-400)}
              disabled={!canScrollLeft}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-white/20 text-white hover:bg-white/10 hover:border-white/40 active:scale-95"
                  : "border-white/5 text-white/20 cursor-not-allowed"
              }`}
              title="Scorri indietro"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollByAmount(400)}
              disabled={!canScrollRight}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-white/20 text-white hover:bg-white/10 hover:border-white/40 active:scale-95"
                  : "border-white/5 text-white/20 cursor-not-allowed"
              }`}
              title="Scorri avanti"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider Apple-Style Scroll-Snap */}
        <div
          ref={sliderRef}
          className="showgallery-slider no-scrollbar flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-8 sm:px-8"
        >
          {config.showgallery.slides.map((slide) => {
            const isPriceVisible = shouldShowPrice(slide.showPriceOverride);
            return (
              <div
                key={slide.id}
                className="showgallery-card flex-none w-[310px] sm:w-[380px] group bg-luxe-card border border-white/10 rounded-2xl overflow-hidden hover:border-amber-400/40 transition-all duration-300 flex flex-col"
              >
                {/* Immagine Still-Life con Zoom */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-black/40 image-zoom-container">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Badge Prezzo o Richiesta */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-black/60 border border-white/15 text-white shadow-lg">
                      {isPriceVisible ? slide.price : config.pricing.hiddenPriceFallbackText}
                    </span>
                  </div>
                </div>

                {/* Dettagli & CTA */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-luxury text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-luxe-sub leading-relaxed font-light mb-6">
                      {slide.specs}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenReserve(slide.title)}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-black border border-white/10 hover:border-amber-400 text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>{slide.ctaText}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicatore dinamico pallini per smartphone */}
        <div className="flex md:hidden justify-center items-center space-x-2 mt-4">
          {config.showgallery.slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-6 bg-amber-400" : "w-1.5 bg-white/20"
              }`}
            ></span>
          ))}
        </div>

      </div>
    </section>
  );
}
