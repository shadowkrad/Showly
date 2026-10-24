"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

interface ProtectionContextValue {
  isCaptureActive: boolean;
}

const ProtectionContext = createContext<ProtectionContextValue>({
  isCaptureActive: false,
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
 * Sistema stile Disney+ / Streaming:
 * - Nessun popup invasivo, nessuna sfocatura durante la normale navigazione.
 * - Quando viene attivato "Cattura Immagine" (Win+Shift+S, Strumento di Cattura, PrintScreen, Cmd+Shift+3/4/5)
 *   oppure un overlay di cattura prende il focus del sistema operativo, SOLO i riquadri delle foto
 *   diventano silenziosamente neri (#000000) e tornano visibili da soli appena si chiude lo strumento di cattura.
 */
export function PhotoProtectionShield({
  children,
  enabled = true,
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
    <ProtectionContext.Provider value={{ isCaptureActive }}>
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
 * Riquadro Foto con oscuramento silenzioso stile Disney+:
 * - Durante la normale visione la foto è 100% nitida e pulita.
 * - Appena si attiva lo strumento Cattura Immagine / Screenshot, solo il riquadro della foto diventa nero (#000000)
 *   e torna subito visibile da solo appena termina la cattura.
 */
export function ProtectedModelImage({
  src,
  alt,
  className = "",
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  watermarkOverride?: string;
  forceWatermark?: boolean;
  forceLoupe?: boolean;
}) {
  const { isCaptureActive } = usePhotoProtection();

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
