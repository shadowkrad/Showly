"use client";

import { MapPin, Clock, Compass } from "lucide-react";
import { ShowlyConfig } from "@/lib/config";
import { ProtectedModelImage } from "@/components/PhotoProtectionShield";

interface AtelierSectionProps {
  config: ShowlyConfig;
  isMobilePreview?: boolean;
}

export default function AtelierSection({
  config,
  isMobilePreview = false,
}: AtelierSectionProps) {
  return (
    <section
      id="bottega"
      className={`${
        isMobilePreview ? "py-10" : "py-14 sm:py-24"
      } border-b border-white/5 relative overflow-hidden`}
    >
      <div className={`max-w-7xl mx-auto ${isMobilePreview ? "px-4" : "px-4 sm:px-8"}`}>
        <div
          className={`grid items-center ${
            isMobilePreview
              ? "grid-cols-1 gap-7"
              : "grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          }`}
        >
          {/* Foto Bottega Still-Life / Banco da lavoro */}
          <div className={isMobilePreview ? "" : "lg:col-span-6 relative"}>
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <ProtectedModelImage
                src={config.atelier.photoUrl}
                alt="La Bottega"
                className="w-full h-full object-cover object-center brightness-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

              {/* Badge di stato aperto/chiuso */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between gap-2 backdrop-blur-md bg-black/65 border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="text-[11px] sm:text-xs font-semibold text-white truncate">
                    {config.atelier.statusLiveText}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 shrink-0">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Dettagli e Orari di Ricezione */}
          <div
            className={`${
              isMobilePreview ? "" : "lg:col-span-6"
            } flex flex-col justify-center`}
          >
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-amber-400 uppercase font-mono mb-1.5 block">
              {config.atelier.tagLabel}
            </span>
            <h2
              className={`font-serif-luxury font-bold text-white tracking-tight ${
                isMobilePreview ? "text-2xl mb-4" : "text-2xl sm:text-5xl mb-5 sm:mb-6"
              }`}
            >
              {config.atelier.heading}
            </h2>
            <p className="text-xs sm:text-sm text-luxe-sub leading-relaxed font-light mb-6 sm:mb-8">
              {config.atelier.description}
            </p>

            {/* Scheda Orari e Indirizzo */}
            <div className="bg-luxe-card border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 space-y-3.5">
              <div className="flex items-start space-x-3 text-xs text-luxe-light">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.atelier.addressText}</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-luxe-sub border-t border-white/5 pt-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{config.atelier.hoursWeekdayText}</div>
                  <div>{config.atelier.hoursSaturdayText}</div>
                  <div className="text-rose-400/80">
                    {config.atelier.hoursSundayText}
                  </div>
                </div>
              </div>
            </div>

            {/* Pulsante Indicazioni Stradali Google Maps (WhatsApp è nel pallino flottante standard in basso a destra) */}
            <div className="flex">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  config.atelier.addressText
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  isMobilePreview ? "w-full" : "w-full sm:w-auto"
                } px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all inline-flex items-center justify-center space-x-2`}
              >
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{config.atelier.directionsButtonText}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
