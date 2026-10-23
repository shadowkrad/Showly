"use client";

import Link from "next/link";
import { ShowlyConfig } from "@/lib/config";

interface HeaderProps {
  config: ShowlyConfig;
  onOpenReserve: (itemTitle?: string) => void;
}

export default function Header({ config, onOpenReserve }: HeaderProps) {
  return (
    <nav className="sticky top-0 z-50 nav-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Brand Logo / Titolo Essenziale */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wider text-white uppercase group-hover:text-amber-300 transition-colors">
            {config.brand.name}
          </span>
          <span
            className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block"
            title="Aperto adesso"
          ></span>
        </div>

        {/* Voci Menu discrete */}
        <div className="hidden md:flex items-center space-x-10 text-xs font-semibold uppercase tracking-[0.2em] text-luxe-sub">
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

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <a
            href={`https://wa.me/${config.atelier.whatsappButtonText.replace(/[^0-9]/g, "") || "393400000000"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex text-xs text-luxe-sub hover:text-emerald-400 font-medium transition-colors"
          >
            {config.navigation.whatsappLabel}
          </a>
          <button
            onClick={() => onOpenReserve()}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            {config.navigation.ctaButtonLabel}
          </button>
        </div>

      </div>
    </nav>
  );
}
