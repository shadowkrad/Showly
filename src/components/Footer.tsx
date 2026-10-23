"use client";

import { ShowlyConfig } from "@/lib/config";

interface FooterProps {
  config: ShowlyConfig;
}

export default function Footer({ config }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-white/5 bg-black/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-luxe-sub">
        
        {/* Brand & Dati Legali */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-serif-luxury font-bold text-white text-base tracking-wider uppercase">
            {config.brand.name}
          </span>
          <span className="hidden sm:inline-block text-white/20">•</span>
          <span>{config.footer.legalText}</span>
        </div>

        {/* Link GDPR */}
        <div className="flex items-center space-x-6">
          <a
            href="#"
            className="hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            {config.footer.privacyPolicyLabel}
          </a>
        </div>

      </div>
    </footer>
  );
}
