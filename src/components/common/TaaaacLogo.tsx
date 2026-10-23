import React from "react";

interface TaaaacLogoProps {
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
  iconSize?: number;
  textSize?: string;
}

export function TaaaacLogo({
  className = "",
  showBadge = true,
  badgeText = "Showly",
  iconSize = 24,
  textSize = "text-lg",
}: TaaaacLogoProps) {
  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
      {/* Icona Saetta Taaaac (Ambra/Oro Showly) */}
      <div
        className="rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs"
        style={{ width: iconSize + 6, height: iconSize + 6 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: iconSize - 6, height: iconSize - 6 }}
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
        </svg>
      </div>

      {/* Testo Logo Taaaac */}
      <div className="flex items-center gap-1.5 leading-none">
        <span className={`font-black ${textSize} tracking-tight`}>
          <span className="text-white">Taaa</span>
          <span className="text-amber-400">ac</span>
        </span>

        {/* Badge Modulo */}
        {showBadge && (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-normal uppercase">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Icona Standard Personalizzata del Modulo Showly (Diamante Taglio Brillante & Scintilla d'Autore)
 */
export function ShowlyModuleIcon({
  size = 38,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-gradient-to-br from-stone-800 via-neutral-900 to-black border border-amber-400/40 shadow-md flex items-center justify-center shrink-0 relative overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        className="w-[72%] h-[72%] drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="shGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="shGoldDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        <g transform="translate(256, 255)">
          {/* Corona Superiore */}
          <polygon points="-68,-120 68,-120 96,-42 -96,-42" fill="url(#shGoldLight)" />
          <polygon points="-155,-42 -68,-120 -96,-42" fill="url(#shGoldGrad)" />
          <polygon points="155,-42 68,-120 96,-42" fill="url(#shGoldDark)" />
          {/* Padiglione Inferiore */}
          <polygon points="-96,-42 96,-42 0,140" fill="url(#shGoldGrad)" />
          <polygon points="-155,-42 -96,-42 0,140" fill="url(#shGoldDark)" />
          <polygon points="155,-42 96,-42 0,140" fill="url(#shGoldLight)" fillOpacity="0.9" />
          {/* Rifrazioni */}
          <polyline
            points="-155,-42 155,-42"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
            strokeOpacity="0.8"
          />
          <polyline
            points="-68,-120 -96,-42 0,140 96,-42 68,-120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeOpacity="0.7"
            strokeLinejoin="round"
          />
          {/* Base Vetrina */}
          <rect x="-105" y="162" width="210" height="16" rx="8" fill="url(#shGoldGrad)" />
          {/* Scintilla Glamour */}
          <path
            d="M130 -145 Q130 -105 170 -105 Q130 -105 130 -65 Q130 -105 90 -105 Q130 -105 130 -145 Z"
            fill="#ffffff"
          />
        </g>
      </svg>
    </div>
  );
}
