"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useId,
} from "react";

interface ProtectionContextValue {
  isCaptureActive: boolean;
  watermarkText?: string;
  showWatermark?: boolean;
}

const ProtectionContext = createContext<ProtectionContextValue>({
  isCaptureActive: false,
  showWatermark: false,
});

export const usePhotoProtection = () => useContext(ProtectionContext);

interface PhotoProtectionShieldProps {
  children: React.ReactNode;
  enabled?: boolean;
  strictFocusLock?: boolean;
  defaultLoupeMode?: boolean;
  watermarkText?: string;
  showWatermark?: boolean;
  showFloatingBadge?: boolean;
}

/**
 * Sistema di Protezione Multilivello Showly:
 * 1. Disney+-Style Silent Blackout:
 *    - Nessun popup bloccante o sfocatura durante la normale navigazione.
 *    - Quando viene attivato "Cattura Immagine" (Win+Shift+S, Strumento di Cattura, PrintScreen, Cmd+Shift+3/4/5)
 *      oppure un overlay di sistema toglie il focus alla finestra del browser, SOLO i riquadri delle foto
 *      diventano silenziosamente neri (#000000) e si ripristinano da soli appena termina la cattura.
 * 2. Filigrana Forense Nominativa (Anti-Leak Smartphone):
 *    - Nei cataloghi riservati e nella Cassaforte, le foto contengono una sottile filigrana diagonale
 *      con nome destinatario e token univoco.
 *    - Se un utente scatta uno screenshot con i tasti fisici del telefono (Power + Volume), l'immagine salvata
 *      rimane indelebilmente marchiata con la sua identità, tracciando qualsiasi fuga di notizie.
 * 3. Supporto FLAG_SECURE Nativo:
 *    - Nel wrapper mobile nativo (Android/iOS), il sistema operativo blocca fisicamente gli screenshot hardware.
 */
export function PhotoProtectionShield({
  children,
  enabled = true,
  watermarkText,
  showWatermark = false,
}: PhotoProtectionShieldProps) {
  const [isCaptureActive, setIsCaptureActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let restoreTimer: ReturnType<typeof setTimeout> | null = null;

    const clearRestoreTimer = () => {
      if (restoreTimer) {
        clearTimeout(restoreTimer);
        restoreTimer = null;
      }
    };

    const scheduleRestore = (delayMs = 800) => {
      clearRestoreTimer();
      restoreTimer = setTimeout(() => {
        if (typeof document !== "undefined" && document.hasFocus() && !document.hidden) {
          setIsCaptureActive(false);
        }
      }, delayMs);
    };

    // 1. Blocco silenzioso tasto destro e trascinamento sulle foto
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "IMG" ||
          target.tagName === "CANVAS" ||
          target.closest("[data-protected-photo]"))
      ) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "IMG" ||
          target.tagName === "CANVAS" ||
          target.closest("[data-protected-photo]"))
      ) {
        e.preventDefault();
      }
    };

    // 2. Oscuramento silenzioso dei soli riquadri foto su avvio Strumento di Cattura (Win+Shift+S, PrintScreen, Cmd+Shift+3/4/5)
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        activeTag === "SELECT"
      ) {
        return;
      }

      if (
        e.key === "PrintScreen" ||
        e.keyCode === 44 ||
        e.key === "Meta" ||
        e.key === "OS" ||
        (e.metaKey && e.shiftKey) ||
        (e.ctrlKey && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase()))
      ) {
        clearRestoreTimer();
        setIsCaptureActive(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        setIsCaptureActive(true);
        scheduleRestore(1200);
        return;
      }
      if (!e.metaKey && !e.shiftKey && !e.ctrlKey) {
        scheduleRestore(300);
      }
    };

    // 3. Quando si apre il "Cattura Immagine" di Windows/Mac, l'overlay di sistema toglie il focus alla finestra:
    // oscuriamo silenziosamente solo le foto e le ripristiniamo in automatico appena il focus torna!
    const handleWindowBlur = () => {
      clearRestoreTimer();
      setIsCaptureActive(true);
    };

    const handleWindowFocus = () => {
      clearRestoreTimer();
      setIsCaptureActive(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsCaptureActive(true);
      } else {
        setIsCaptureActive(false);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearRestoreTimer();
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return (
    <ProtectionContext.Provider
      value={{
        isCaptureActive,
        watermarkText,
        showWatermark,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              [data-protected-photo="true"] {
                background: #000000 !important;
              }
              [data-protected-photo="true"] img {
                opacity: 0 !important;
                visibility: hidden !important;
              }
            }
            .showly-protected-media {
              -webkit-user-select: none;
              user-select: none;
              -webkit-touch-callout: none;
              pointer-events: none;
            }
          `,
        }}
      />
      {children}
    </ProtectionContext.Provider>
  );
}

/**
 * Riquadro Foto con doppia protezione:
 * 1. Oscuramento silenzioso stile Disney+ (#000000 su rilevamento cattura/focus loss).
 * 2. Filigrana Forense Nominativa elegante (visibile in caso di screenshot fisici smartphone Volume+Power).
 */
export function ProtectedModelImage({
  src,
  alt,
  className = "",
  style,
  watermarkText: explicitWatermarkText,
  showForensicWatermark: explicitShowForensic,
  watermarkOverride,
  forceWatermark,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  watermarkText?: string;
  showForensicWatermark?: boolean;
  watermarkOverride?: string;
  forceWatermark?: boolean;
  forceLoupe?: boolean;
}) {
  const {
    isCaptureActive,
    watermarkText: contextWatermarkText,
    showWatermark: contextShowWatermark,
  } = usePhotoProtection();

  const rawId = useId();
  const patternId = `wm_${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const activeWatermarkText =
    watermarkOverride || explicitWatermarkText || contextWatermarkText || "";
  const isForensicWatermarkActive =
    forceWatermark ||
    explicitShowForensic ||
    (contextShowWatermark && Boolean(activeWatermarkText));

  return (
    <div
      data-protected-photo="true"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className="relative w-full h-full overflow-hidden select-none bg-black"
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        className={`showly-protected-media ${className} transition-opacity duration-75 ${
          isCaptureActive ? "opacity-0 invisible" : "opacity-100 visible"
        }`}
        style={style}
      />

      {/* Filigrana Forense Nominativa Diagonale (Anti-Leak Screenshot Smartphone) */}
      {isForensicWatermarkActive && activeWatermarkText && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id={patternId}
              width="260"
              height="90"
              patternTransform="rotate(-22 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <text
                x="10"
                y="45"
                fill="rgba(255, 255, 255, 0.16)"
                stroke="rgba(0, 0, 0, 0.32)"
                strokeWidth="0.5"
                fontSize="11"
                fontWeight="600"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                letterSpacing="1.2px"
              >
                {activeWatermarkText}
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      )}

      {/* Micro-badge forense elegante al bordo inferiore */}
      {isForensicWatermarkActive && activeWatermarkText && (
        <div
          aria-hidden="true"
          className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none px-2 py-0.5 rounded bg-black/55 backdrop-blur-md border border-amber-400/20 text-[9px] font-mono tracking-wider text-amber-200/80 uppercase shadow-lg select-none"
        >
          <span className="truncate">🛡️ {activeWatermarkText}</span>
          <span className="shrink-0 text-[8px] opacity-70 ml-2">FORENSIC PROTECTED</span>
        </div>
      )}

      {/* Strato trasparente anti-salvataggio diretto (blocca "Salva immagine con nome") */}
      <div
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="absolute inset-0 z-10 bg-transparent"
      />
    </div>
  );
}
