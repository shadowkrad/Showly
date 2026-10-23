"use client";

import { MapPin, Clock, MessageSquare, Compass } from "lucide-react";
import { ShowlyConfig } from "@/lib/config";

interface AtelierSectionProps {
  config: ShowlyConfig;
}

export default function AtelierSection({ config }: AtelierSectionProps) {
  const cleanPhone = config.atelier.whatsappButtonText.replace(/[^0-9]/g, "") || "393400000000";

  return (
    <section id="bottega" className="py-20 sm:py-28 border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Foto Bottega Still-Life / Banco da lavoro */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={config.atelier.photoUrl}
                alt="La Bottega"
                className="w-full h-full object-cover object-center brightness-90 hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

              {/* Badge di stato aperto/chiuso */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between backdrop-blur-md bg-black/60 border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-white">
                    {config.atelier.statusLiveText}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Dettagli e Orari di Ricezione */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400 uppercase font-mono mb-2 block">
              {config.atelier.tagLabel}
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6">
              {config.atelier.heading}
            </h2>
            <p className="text-sm text-luxe-sub leading-relaxed font-light mb-8">
              {config.atelier.description}
            </p>

            {/* Scheda Orari e Indirizzo */}
            <div className="bg-luxe-card border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
              <div className="flex items-start space-x-3 text-xs text-luxe-light">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.atelier.addressText}</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-luxe-sub border-t border-white/5 pt-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{config.atelier.hoursWeekdayText}</div>
                  <div>{config.atelier.hoursSaturdayText}</div>
                  <div className="text-rose-400/80">{config.atelier.hoursSundayText}</div>
                </div>
              </div>
            </div>

            {/* Pulsanti Azione: Mappa & WhatsApp */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.atelier.addressText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-2"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>{config.atelier.directionsButtonText}</span>
              </a>

              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg hover:scale-105 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{config.atelier.whatsappButtonText}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
