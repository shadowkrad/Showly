"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Lock, EyeOff, ShieldCheck, ScanEye, Eye } from "lucide-react";

interface ProtectionContextValue {
  isShieldTriggered: boolean;
  isTempMasked: boolean; // Oscuramento istantaneo su pressione Shift/Win/Ctrl/Alt o uscita mouse
  loupeMode: boolean; // Modalità Lente Anti-Video (mostra nitido solo sotto il dito/cursore)
  setLoupeMode: (v: boolean) => void;
  triggerReason: string | null;
  watermarkText: string;
  showWatermark: boolean;
  triggerManualTest: () => void;
  dismissShield: () => void;
}

const ProtectionContext = createContext<ProtectionContextValue>({
  isShieldTriggered: false,
  isTempMasked: false,
  loupeMode: true,
  setLoupeMode: () => {},
  triggerReason: null,
  watermarkText: "ATELIER AURORA • MODELLO PROTETTO",
  showWatermark: true,
  triggerManualTest: () => {},
  dismissShield: () => {},
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

export function PhotoProtectionShield({
  children,
  enabled = true,
  strictFocusLock = true,
  defaultLoupeMode = false,
  watermarkText = "PROPRIETÀ RISERVATA • VIETATA LA RIPRODUZIONE",
  showWatermark = true,
  showFloatingBadge = true,
}: PhotoProtectionShieldProps) {
  const [isShieldTriggered, setIsShieldTriggered] = useState(false);
  const [isTempMasked, setIsTempMasked] = useState(false);
  const [loupeMode, setLoupeMode] = useState(defaultLoupeMode);
  const [triggerReason, setTriggerReason] = useState<string | null>(null);
  const [toastWarning, setToastWarning] = useState<string | null>(null);

  const showWarningToast = useCallback((msg: string) => {
    setToastWarning(msg);
    setTimeout(() => {
      setToastWarning((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const activateBlackout = useCallback((reason: string) => {
    setIsShieldTriggered(true);
    setIsTempMasked(true);
    setTriggerReason(reason);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          "🔒 Contenuto protetto da Scudo Anti-Cattura Showly."
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const dismissShield = useCallback(() => {
    setIsShieldTriggered(false);
    setIsTempMasked(false);
    setTriggerReason(null);
  }, []);

  const triggerManualTest = useCallback(() => {
    activateBlackout(
      "Simulazione Scudo Anti-Registrazione & Anti-Cattura attivata."
    );
  }, [activateBlackout]);

  useEffect(() => {
    if (!enabled) return;

    // 1. Polling a 60fps di document.hasFocus():
    // Cattura in <16ms qualsiasi perdita di fuoco verso Strumento di Cattura (Win+Shift+S), OBS, ShareX o barra di stato mobile
    let rafId: number;
    const checkFocusLoop = () => {
      if (strictFocusLock && typeof document !== "undefined") {
        if (!document.hasFocus() || document.hidden) {
          setIsTempMasked(true);
        }
      }
      rafId = requestAnimationFrame(checkFocusLoop);
    };
    rafId = requestAnimationFrame(checkFocusLoop);

    // 2. Blocco Tasto Destro & Pressione Prolungata
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        !target ||
        (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA")
      ) {
        e.preventDefault();
        showWarningToast(
          "🔒 Salvataggio e copia disabilitati: modelli protetti da diritto d'autore."
        );
      }
    };

    // 3. Blocco Drag & Drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 4. INTERCETTAZIONE PREVENTIVA TASTI MODIFICATORI (Win/Meta, Shift, Ctrl, Alt, PrintScreen, F12)
    // Perché Win+Shift+S o Cmd+Shift+4 venivano catturati prima? Perché il sistema operativo intercetta la 'S' finale,
    // MA il browser riceve SEMPRE il keydown di 'Meta' (Win/Cmd) o 'Shift' un istante PRIMA che l'utente prema 'S'!
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      const isTypingInInput =
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        activeTag === "SELECT";

      const key = e.key.toLowerCase();

      // Se l'utente NON sta scrivendo in un campo di testo e preme qualsiasi tasto modificatore
      // (Meta/Win, Shift, Control, Alt) -> oscura preventivamente in 0ms tutte le foto!
      if (
        !isTypingInInput &&
        (e.key === "Meta" ||
          e.key === "Shift" ||
          e.key === "Control" ||
          e.key === "Alt" ||
          e.key === "OS" ||
          e.metaKey ||
          e.ctrlKey ||
          e.altKey)
      ) {
        setIsTempMasked(true);
      }

      // PrintScreen o F12 o combinazioni di cattura note -> attiva il sipario permanente
      if (
        e.key === "PrintScreen" ||
        e.keyCode === 44 ||
        e.key === "F12" ||
        (e.metaKey && e.shiftKey) ||
        (e.ctrlKey && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && ["s", "p", "u", "g"].includes(key))
      ) {
        e.preventDefault();
        activateBlackout(
          "Rilevata combinazione di tasti per cattura schermo, registrazione o salvataggio."
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        activateBlackout("Rilevato tasto PrintScreen (Cattura Schermo).");
        return;
      }
      // Se il sipario permanente non è scattato e la finestra ha ancora il focus, rimuove la maschera preventiva dopo 600ms dal rilascio dei tasti
      if (!e.metaKey && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        setTimeout(() => {
          if (document.hasFocus() && !document.hidden) {
            setIsTempMasked(false);
          }
        }, 600);
      }
    };

    // 5. Oscuramento su uscita del cursore dalla finestra (es. per cliccare OBS / Cattura su barra applicazioni o secondo monitor)
    const handleMouseLeaveViewport = (e: MouseEvent) => {
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsTempMasked(true);
      }
    };

    const handleMouseEnterViewport = () => {
      if (document.hasFocus() && !isShieldTriggered) {
        setIsTempMasked(false);
      }
    };

    // 6. Multi-touch su Smartphone (es. Screenshot a 3 dita o combo tasti che genera touchcancel)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        // Più di 1 dito sullo schermo -> oscura immediatamente per bloccare screenshot multi-touch o pinch
        setIsTempMasked(true);
        activateBlackout(
          "Rilevato gesto multi-touch / cattura schermata su dispositivo mobile."
        );
      }
    };

    const handleTouchCancel = () => {
      // iOS e Android lanciano touchcancel quando viene premuto Power + Volume Su per fare uno screenshot!
      setIsTempMasked(true);
      activateBlackout(
        "Interruzione touch di sistema rilevata (protezione screenshot mobile)."
      );
    };

    const handleWindowBlur = () => {
      setIsTempMasked(true);
      if (strictFocusLock) {
        activateBlackout(
          "Finestra fuori fuoco: le foto sono state oscurate automaticamente per impedire catture da programmi esterni (Strumento di Cattura, OBS, Screen Recorder)."
        );
      }
    };

    const handleWindowFocus = () => {
      if (!isShieldTriggered) {
        setIsTempMasked(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTempMasked(true);
        if (strictFocusLock) {
          activateBlackout(
            "Cambio scheda o app rilevato: protezione visuale attivata."
          );
        }
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.documentElement.addEventListener(
      "mouseleave",
      handleMouseLeaveViewport
    );
    document.documentElement.addEventListener(
      "mouseenter",
      handleMouseEnterViewport
    );
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeaveViewport
      );
      document.documentElement.removeEventListener(
        "mouseenter",
        handleMouseEnterViewport
      );
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    enabled,
    strictFocusLock,
    isShieldTriggered,
    activateBlackout,
    showWarningToast,
  ]);

  return (
    <ProtectionContext.Provider
      value={{
        isShieldTriggered,
        isTempMasked,
        loupeMode,
        setLoupeMode,
        triggerReason,
        watermarkText,
        showWatermark,
        triggerManualTest,
        dismissShield,
      }}
    >
      {/* Regola CSS Anti-Stampa / Anti-Esportazione PDF */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                display: none !important;
                visibility: hidden !important;
              }
              body::after {
                content: "🔒 CONTENUTO PROTETTO — STAMPA E SALVATAGGIO DEI MODELLI VIETATI";
                display: block !important;
                visibility: visible !important;
                padding: 40px;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
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

      <div className="relative select-none">
        {children}

        {/* Toast di Avviso Blocco Salvataggio / Tasto Destro */}
        {toastWarning && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-black/95 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 whitespace-nowrap animate-in fade-in duration-150">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastWarning}</span>
          </div>
        )}

        {/* Barra Flottante Controllo Scudo & Modalità Lente Anti-Video in Basso a Sinistra */}
        {enabled && showFloatingBadge && (
          <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLoupeMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-[10px] font-bold shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                loupeMode
                  ? "bg-amber-400 text-black border-amber-300"
                  : "bg-black/85 hover:bg-black text-amber-300 border-amber-400/35"
              }`}
              title="Attiva/Disattiva il Velo Ottico Anti-Video (mostra la foto nitida solo dove passi col dito o col mouse)"
            >
              {loupeMode ? (
                <>
                  <ScanEye className="w-3.5 h-3.5 shrink-0" />
                  <span>Lente Anti-Video: ON</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Scudo Anti-Cattura</span>
                  <span className="sm:hidden">Scudo ON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={triggerManualTest}
              className="px-2.5 py-2 rounded-full bg-black/85 hover:bg-amber-400 text-amber-200 hover:text-black border border-white/15 text-[10px] font-bold shadow-xl backdrop-blur-md transition-all cursor-pointer"
              title="Simula il blocco schermo anti-cattura"
            >
              Test Blocco
            </button>
          </div>
        )}

        {/* SIPARIO DI OSCURAMENTO IMMEDIATO (SIA SU TRIGGER PERMANENTE SIA SU PRESSIONE TASTI / USCITA MOUSE) */}
        {(isShieldTriggered || isTempMasked) && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-neutral-950 border border-amber-400/40 rounded-3xl p-7 sm:p-8 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto">
                <EyeOff className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 block mb-1">
                  Scudo Protezione Modelli Showly
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
                  Immagini Oscurate per Sicurezza
                </h2>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  {triggerReason ||
                    "Rilevata pressione tasti di cattura (Win/Shift/Ctrl/PrintScreen) o passaggio a un programma esterno fuori dalla finestra."}
                </p>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Per impedire screenshot e registrazioni esterne dei modelli, la vetrina si oscura istantaneamente quando la finestra perde il focus o vengono premuti tasti di cattura.
                </p>
              </div>

              <button
                type="button"
                onClick={dismissShield}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                🔓 Ripristina Visione Protetta
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectionContext.Provider>
  );
}

/**
 * Componente Immagine Corazzata Anti-Screenshot & Anti-Registrazione Video
 * 1. Oscuramento 0ms appena isShieldTriggered o isTempMasked diventa true (su keydown di Shift/Win/Ctrl o uscita mouse/focus)
 * 2. Modalità "Lente Anti-Video" (loupeMode): l'immagine di base è criptata/sfocata e solo un cerchio (lente d'ispezione)
 *    sotto il cursore o sotto il dito rivela i dettagli del gioiello/modello -> così neppure una registrazione video
 *    già avviata in background (OBS o registrazione schermo telefono) può mai catturare il modello intero!
 * 3. Filigrana Forense Dinamica in movimento continuo (shimmer anti-telecamera esterna)
 */
export function ProtectedModelImage({
  src,
  alt,
  className = "",
  style,
  watermarkOverride,
  forceWatermark,
  forceLoupe,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  watermarkOverride?: string;
  forceWatermark?: boolean;
  forceLoupe?: boolean;
}) {
  const {
    isShieldTriggered,
    isTempMasked,
    loupeMode,
    watermarkText,
    showWatermark,
  } = usePhotoProtection();

  const containerRef = useRef<HTMLDivElement>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [phase, setPhase] = useState(0);

  const isBlackedOut = isShieldTriggered || isTempMasked;
  const activeLoupe = forceLoupe ?? loupeMode;
  const displayWatermark = forceWatermark ?? showWatermark;
  const label = watermarkOverride || watermarkText;

  // Movimento ciclico della filigrana forense per disturbare codec di registrazione video
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  const updatePointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPointerPos({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      data-protected-photo="true"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onMouseMove={(e) => {
        if (activeLoupe) updatePointer(e.clientX, e.clientY);
      }}
      onMouseLeave={() => setPointerPos(null)}
      onTouchStart={(e) => {
        if (e.touches.length === 1 && activeLoupe) {
          updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length > 1) {
          setPointerPos(null);
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 1 && activeLoupe) {
          updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        } else {
          setPointerPos(null);
        }
      }}
      onTouchEnd={() => setPointerPos(null)}
      onTouchCancel={() => setPointerPos(null)}
      className="relative w-full h-full overflow-hidden select-none bg-black"
    >
      {/* Se scatta il blocco preventivo (Shift/Win/Blur/Screenshot), non renderizza proprio i pixel dell'immagine! */}
      {!isBlackedOut ? (
        <>
          {/* Strato Base: se Lente Anti-Video è attiva, il modello intero resta sfocato/protetto */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            loading="lazy"
            className={`showly-protected-media ${className} ${
              activeLoupe ? "blur-xl brightness-50 scale-105" : ""
            }`}
            style={style}
          />

          {/* Strato Lente d'Ispezione Anti-Registrazione Video (visibile solo sotto il dito/cursore!) */}
          {activeLoupe && pointerPos && (
            <img
              src={src}
              alt={alt}
              draggable={false}
              className={`showly-protected-media absolute inset-0 ${className}`}
              style={{
                ...style,
                clipPath: `circle(88px at ${pointerPos.x}px ${pointerPos.y}px)`,
                WebkitClipPath: `circle(88px at ${pointerPos.x}px ${pointerPos.y}px)`,
              }}
            />
          )}

          {/* Indicatore Lente quando l'utente non sta toccando la card */}
          {activeLoupe && !pointerPos && (
            <div className="absolute inset-0 z-15 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-black/75 border border-amber-400/50 text-amber-300 flex items-center justify-center mb-2 shadow-lg">
                <Eye className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full bg-black/80 border border-white/15 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                Passa o tieni premuto per ispezionare
              </span>
            </div>
          )}

          {/* Filigrana Forense Dinamica & Griglia Anti-Cattura Video */}
          {displayWatermark && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex flex-col justify-between p-3 opacity-35 transition-transform duration-700"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-32deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 16px)",
              }}
            >
              <div
                className={`flex justify-between items-center text-[8px] font-mono uppercase tracking-[0.2em] text-white/80 -rotate-12 select-none transition-all duration-500 ${
                  phase % 2 === 0 ? "translate-x-2 translate-y-3" : "-translate-x-2 translate-y-5"
                }`}
              >
                <span>{label}</span>
              </div>
              <div
                className={`flex justify-center items-center text-[9px] font-mono uppercase tracking-[0.22em] text-amber-200/90 -rotate-12 select-none text-center transition-all duration-500 ${
                  phase < 2 ? "translate-y-1" : "-translate-y-2"
                }`}
              >
                <span>🔒 {label}</span>
              </div>
              <div className="flex justify-end items-center text-[8px] font-mono uppercase tracking-[0.2em] text-white/80 -rotate-12 -translate-y-3 select-none">
                <span>PROPRIETÀ PROTETTA • VIETATA LA COPIA</span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Oscuramento Totale Istantaneo (0ms) */
        <div className="w-full h-full bg-black flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-400/40" />
        </div>
      )}

      {/* Velo Corazzato Trasparente che intercetta qualsiasi click destro / tap prolungato */}
      <div
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="absolute inset-0 z-20 bg-transparent"
      />
    </div>
  );
}
