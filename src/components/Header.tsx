"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Menu, X } from "lucide-react";
import { ShowlyConfig } from "@/lib/config";
import { ShowlyModuleIcon } from "@/components/common/TaaaacLogo";

interface HeaderProps {
  config: ShowlyConfig;
  onOpenReserve: (itemTitle?: string) => void;
  isMobilePreview?: boolean;
}

export default function Header({
  config,
  onOpenReserve,
  isMobilePreview = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 nav-glass w-full">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between gap-2 ${
          isMobilePreview
            ? "px-3.5 h-16"
            : "px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 sm:gap-4"
        }`}
      >
        {/* Brand Logo / Icona Modulo Standard + Titolo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group min-w-0 shrink"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {config.brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.brand.logoUrl}
              alt={config.brand.name}
              className={`${
                isMobilePreview
                  ? "h-8 max-w-[100px]"
                  : "h-8 sm:h-10 max-w-[120px] sm:max-w-[160px]"
              } object-contain rounded-xl shrink-0`}
            />
          ) : (
            <ShowlyModuleIcon
              size={isMobilePreview ? 34 : 38}
              className="group-hover:border-amber-300 transition-colors"
            />
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-serif-luxury font-bold tracking-wider text-white uppercase group-hover:text-amber-300 transition-colors truncate block leading-tight ${
                  isMobilePreview
                    ? "text-base"
                    : "text-base sm:text-2xl lg:text-3xl"
                }`}
              >
                {config.brand.name}
              </span>
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"
                title="Aperto adesso"
              />
            </div>
            <span
              className={`text-amber-300/80 font-mono uppercase tracking-widest truncate block ${
                isMobilePreview ? "text-[9px]" : "text-[9px] sm:text-[10px]"
              }`}
            >
              Vetrina d&apos;Autore
            </span>
          </div>
        </div>

        {/* Voci Menu Desktop (nascoste su mobile e nel simulatore mobile) */}
        {!isMobilePreview && (
          <div className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-[0.18em] text-luxe-sub shrink-0">
            <a href="#showgallery" className="hover:text-white transition-colors">
              {config.navigation.highlightLabel}
            </a>
            <a href="#collezioni" className="hover:text-white transition-colors">
              {config.navigation.collectionsLabel}
            </a>
            <a href="#bottega" className="hover:text-white transition-colors">
              {config.navigation.atelierLabel}
            </a>
          </div>
        )}

        {/* Action Buttons & Lucchetto Area Riservata Esercente in Alto */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={() => onOpenReserve()}
            className={`rounded-full bg-white hover:bg-amber-400 text-black font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${
              isMobilePreview
                ? "px-3 py-1.5 text-[10px]"
                : "px-3 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-xs"
            }`}
          >
            {isMobilePreview ? "Prenota 24h" : config.navigation.ctaButtonLabel}
          </button>

          <Link
            href="/login"
            className="p-2 rounded-full text-luxe-sub/80 hover:text-amber-300 hover:bg-white/10 transition-colors shrink-0"
            title="Accesso Area Riservata Esercente"
          >
            <Lock className="w-4 h-4" />
          </Link>

          {/* Hamburger Menu per Mobile e Simulatore Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`${
              isMobilePreview ? "inline-flex" : "inline-flex lg:hidden"
            } p-2 rounded-full text-luxe-light hover:text-amber-300 hover:bg-white/10 transition-colors shrink-0 cursor-pointer`}
            aria-label="Menu navigazione"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile a Tendina */}
      {mobileMenuOpen && (
        <div
          className={`${
            isMobilePreview ? "block" : "lg:hidden"
          } border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in duration-150`}
        >
          <div className="flex flex-col space-y-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-luxe-light">
            <a
              href="#showgallery"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-white/5 hover:text-amber-300 transition-colors"
            >
              {config.navigation.highlightLabel}
            </a>
            <a
              href="#collezioni"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-white/5 hover:text-amber-300 transition-colors"
            >
              {config.navigation.collectionsLabel}
            </a>
            <a
              href="#bottega"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-white/5 hover:text-amber-300 transition-colors"
            >
              {config.navigation.atelierLabel}
            </a>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReserve();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-400 text-black text-xs font-bold uppercase tracking-wider"
            >
              {config.navigation.ctaButtonLabel}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
