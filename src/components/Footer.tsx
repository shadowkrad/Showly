"use client";

import { ShowlyConfig } from "@/lib/config";
import { ShowlyModuleIcon } from "@/components/common/TaaaacLogo";

interface FooterProps {
  config: ShowlyConfig;
  isMobilePreview?: boolean;
}

export default function Footer({ config, isMobilePreview = false }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-white/5 bg-black/60 py-8 sm:py-12">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-8 flex ${
          isMobilePreview
            ? "flex-col items-center text-center gap-4"
            : "flex-col md:flex-row items-center justify-between gap-4 sm:gap-6"
        } text-xs text-luxe-sub`}
      >
        {/* Brand & Dati Legali */}
        <div
          className={`flex ${
            isMobilePreview
              ? "flex-col items-center gap-2 text-center"
              : "flex-col sm:flex-row items-center gap-2.5 sm:gap-3 text-center sm:text-left"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShowlyModuleIcon size={26} />
            <span className="font-serif-luxury font-bold text-white text-sm sm:text-base tracking-wider uppercase">
              {config.brand.name}
            </span>
          </div>
          {!isMobilePreview && (
            <span className="hidden sm:inline-block text-white/20">•</span>
          )}
          <span className="text-[11px] sm:text-xs">{config.footer.legalText}</span>
        </div>

        {/* Link GDPR */}
        <div className="flex items-center space-x-6 text-[11px] sm:text-xs">
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
