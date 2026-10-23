"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShowlyConfig } from "@/lib/config";
import { ProtectedModelImage } from "@/components/PhotoProtectionShield";

interface ShowGalleryProps {
  config: ShowlyConfig;
  onOpenReserve: (itemTitle: string) => void;
  isMobilePreview?: boolean;
}

export default function ShowGallery({
  config,
  onOpenReserve,
  isMobilePreview = false,
}: ShowGalleryProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);

    const cardWidth = isMobilePreview ? 280 : 340;
    const current = Math.round(scrollLeft / cardWidth);
    setActiveIndex(
      Math.min(Math.max(current, 0), config.showgallery.slides.length - 1)
    );
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [config.showgallery.slides, isMobilePreview]);

  const scrollByAmount = (amount: number) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const shouldShowPrice = (slideShowOverride?: boolean) => {
    if (slideShowOverride !== undefined) return slideShowOverride;
    return config.pricing.showPricesGlobally;
  };

  return (
    <section
      id="showgallery"
      className={`${
        isMobilePreview ? "py-10" : "py-14 sm:py-24"
      } border-b border-white/5 relative overflow-hidden`}
    >
      <div className={`max-w-7xl mx-auto ${isMobilePreview ? "px-4" : "px-4 sm:px-8"}`}>
        {/* Titolo Sezione */}
        <div
          className={`flex ${
            isMobilePreview
              ? "flex-row items-end justify-between gap-3 mb-6"
              : "flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12"
          }`}
        >
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-amber-400 uppercase font-mono mb-1.5 block">
              {config.showgallery.tagLabel}
            </span>
            <h2
              className={`font-serif-luxury font-bold text-white tracking-tight leading-tight ${
                isMobilePreview ? "text-2xl" : "text-2xl sm:text-5xl"
              }`}
            >
              {config.showgallery.sectionTitle}
            </h2>
          </div>

          {/* Frecce di Scorrimento */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollByAmount(isMobilePreview ? -280 : -360)}
              disabled={!canScrollLeft}
              className={`${
                isMobilePreview ? "w-9 h-9" : "w-9 h-9 sm:w-11 sm:h-11"
              } rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-white/20 text-white hover:bg-white/10 hover:border-white/40 active:scale-95 cursor-pointer"
                  : "border-white/5 text-white/20 cursor-not-allowed"
              }`}
              title="Scorri indietro"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(isMobilePreview ? 280 : 360)}
              disabled={!canScrollRight}
              className={`${
                isMobilePreview ? "w-9 h-9" : "w-9 h-9 sm:w-11 sm:h-11"
              } rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-white/20 text-white hover:bg-white/10 hover:border-white/40 active:scale-95 cursor-pointer"
                  : "border-white/5 text-white/20 cursor-not-allowed"
              }`}
              title="Scorri avanti"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Slider Apple-Style Scroll-Snap */}
        <div
          ref={sliderRef}
          className={`showgallery-slider no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto pb-6 ${
            isMobilePreview ? "-mx-4 px-4" : "-mx-4 px-4 sm:-mx-8 sm:px-8"
          }`}
        >
          {config.showgallery.slides.map((slide) => {
            const isPriceVisible = shouldShowPrice(slide.showPriceOverride);
            return (
              <div
                key={slide.id}
                className={`showgallery-card flex-none ${
                  isMobilePreview
                    ? "w-[275px]"
                    : "w-[82vw] max-w-[310px] sm:w-[380px] sm:max-w-none"
                } group bg-luxe-card border border-white/10 rounded-2xl overflow-hidden hover:border-amber-400/40 transition-all duration-300 flex flex-col`}
              >
                {/* Immagine Still-Life con Zoom e Scudo Anti-Cattura */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-black/40 image-zoom-container">
                  <ProtectedModelImage
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{
                      objectPosition: `${slide.posX ?? 50}% ${slide.posY ?? 50}%`,
                      transform: `scale(${slide.zoom ?? 1})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                  {/* Badge Prezzo o Richiesta */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-black/65 border border-white/15 text-white shadow-lg">
                      {isPriceVisible
                        ? slide.price
                        : config.pricing.hiddenPriceFallbackText}
                    </span>
                  </div>
                </div>

                {/* Dettagli & CTA */}
                <div
                  className={`${
                    isMobilePreview ? "p-4" : "p-5 sm:p-6"
                  } flex-1 flex flex-col justify-between`}
                >
                  <div>
                    <h3
                      className={`font-serif-luxury font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors ${
                        isMobilePreview ? "text-xl" : "text-xl sm:text-2xl"
                      }`}
                    >
                      {slide.title}
                    </h3>
                    <p className="text-xs text-luxe-sub leading-relaxed font-light mb-5">
                      {slide.specs}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenReserve(slide.title)}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-black border border-white/10 hover:border-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicatore dinamico pallini per smartphone */}
        <div
          className={`${
            isMobilePreview ? "flex" : "flex md:hidden"
          } justify-center items-center space-x-2 mt-2`}
        >
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
