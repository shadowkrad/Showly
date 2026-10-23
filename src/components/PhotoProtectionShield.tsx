"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ShieldAlert, Lock, EyeOff, ShieldCheck } from "lucide-react";

interface ProtectionContextValue {
  isShieldTriggered: boolean;
  triggerReason: string | null;
  watermarkText: string;
  showWatermark: boolean;
  triggerManualTest: () => void;
  dismissShield: () => void;
}

const ProtectionContext = createContext<ProtectionContextValue>({
  isShieldTriggered: false,
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
  strictFocusLock?: boolean; // Se true (es. in Cassaforte), oscura istantaneamente appena la finestra perde il focus (Snipping Tool / OBS / Recorder)
  watermarkText?: string;
  showWatermark?: boolean;
  showFloatingBadge?: boolean;
}

export function PhotoProtectionShield({
  children,
  enabled = true,
  strictFocusLock = true,
  watermarkText = "PROPRIETÀ RISERVATA • VIETATA LA RIPRODUZIONE",
  showWatermark = true,
  showFloatingBadge = true,
}: PhotoProtectionShieldProps) {
  const [isShieldTriggered, setIsShieldTriggered] = useState(false);
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
    setTriggerReason(reason);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          "Contenuto protetto da Scudo Anti-Cattura Showly."
        );
      }
    } catch {
      // ignore clipboard errors
    }
  }, []);

  const dismissShield = useCallback(() => {
    setIsShieldTriggered(false);
    setTriggerReason(null);
  }, []);

  const triggerManualTest = useCallback(() => {
    activateBlackout(
      "Simulazione Scudo Anti-Registrazione & Anti-Cattura attivata."
    );
  }, [activateBlackout]);

  useEffect(() => {
    if (!enabled) return;

    // 1. Blocco Tasto Destro / Pressione prolungata salvataggio immagine
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "IMG" || target.closest("[data-protected-photo]"))
      ) {
        e.preventDefault();
        showWarningToast(
          "🔒 Salvataggio disabilitato: i modelli sono protetti da Scudo Anti-Copia."
        );
      } else if (strictFocusLock) {
        e.preventDefault();
        showWarningToast(
          "🔒 Catalogo protetto: menu contestuale e download disabilitati."
        );
      }
    };

    // 2. Blocco Trascinamento (Drag & Drop foto sul desktop)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "IMG" || target.closest("[data-protected-photo]"))
      ) {
        e.preventDefault();
        showWarningToast("🔒 Trascinamento e salvataggio modelli bloccati.");
      }
    };

    // 3. Rilevamento Tasti Cattura Schermo, Registrazione, Salvataggio e Ispezione
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // PrintScreen
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        activateBlackout(
          "Rilevato tentativo di cattura schermata (PrintScreen)."
        );
        return;
      }

      // macOS Screenshot / Screen Recording (Cmd + Shift + 3 / 4 / 5)
      if (e.metaKey && e.shiftKey && ["3", "4", "5", "6"].includes(key)) {
        e.preventDefault();
        activateBlackout(
          "Rilevato avvio software di cattura o registrazione schermo."
        );
        return;
      }

      // Windows Snipping Tool / Game Bar Recording (Win + Shift + S / Win + Alt + R / Win + G)
      if (e.metaKey && e.shiftKey && key === "s") {
        e.preventDefault();
        activateBlackout("Rilevato strumento di cattura schermo esterno.");
        return;
      }

      // Ctrl/Cmd + S (Salva pagina completa), Ctrl/Cmd + P (Stampa PDF), Ctrl/Cmd + U (Sorgente)
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(key)) {
        e.preventDefault();
        activateBlackout(
          "Il salvataggio locale e l'esportazione dei modelli non sono consentiti."
        );
        return;
      }

      // DevTools (F12 o Ctrl+Shift+I / Ctrl+Shift+C / Ctrl+Shift+J)
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["i", "c", "j"].includes(key))
      ) {
        e.preventDefault();
        activateBlackout(
          "Rilevata apertura strumenti di ispezione o estrazione asset."
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        activateBlackout(
          "Rilevato tentativo di cattura schermata (PrintScreen)."
        );
      }
    };

    // 4. Oscuramento Automatico su Perdita Focus / Passaggio a Software Esterni (OBS, Cattura, Switch App)
    const handleWindowBlur = () => {
      if (strictFocusLock) {
        activateBlackout(
          "Finestra fuori fuoco: le foto sono state oscurate automaticamente per impedire catture o registrazioni da programmi esterni."
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && strictFocusLock) {
        activateBlackout(
          "Cambio scheda o app rilevato: protezione visuale attivata."
        );
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, strictFocusLock, activateBlackout, showWarningToast]);

  return (
    <ProtectionContext.Provider
      value={{
        isShieldTriggered,
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

        {/* Badge Flottante Scudo Attivo (con pulsante test dimostrativo) */}
        {enabled && showFloatingBadge && (
          <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40">
            <button
              type="button"
              onClick={triggerManualTest}
              className="group flex items-center gap-2 px-3 py-2 rounded-full bg-black/85 hover:bg-black border border-amber-400/35 text-[10px] font-bold text-amber-300 shadow-xl backdrop-blur-md transition-all cursor-pointer"
              title="Clicca per testare l'oscuramento anti-registrazione"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Scudo Anti-Cattura Attivo</span>
              <span className="sm:hidden">Scudo Foto</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 text-[9px] group-hover:bg-amber-400 group-hover:text-black transition-colors">
                Test Oscuramento
              </span>
            </button>
          </div>
        )}

        {/* SIPARIO DI OSCURAMENTO TOTALE QUANDO SI ATTIVA UN PROGRAMMA DI CATTURA O REGISTRAZIONE */}
        {isShieldTriggered && (
          <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-75">
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
                    "È stato rilevato un programma esterno di cattura schermo, registrazione o perdita di focus della finestra."}
                </p>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Per tutelare l&apos;esclusività delle creazioni artigianali, le fotografie vengono oscurate automaticamente durante tentativi di salvataggio o registrazione.
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
 * Componente Immagine Corazzata Anti-Salvataggio e Anti-Registrazione
 * - Impedisce tasto destro, trascinamento e "Salva immagine" su iOS/Android/Desktop
 * - Applica un velo trasparente intercettore sopra il nodo <img>
 * - Applica una filigrana forense dinamica in movimento (anti-registrazione esterna)
 * - Oscura istantaneamente il fotogramma (brightness-0 blur-2xl) in caso di trigger dello Scudo
 */
export function ProtectedModelImage({
  src,
  alt,
  className = "",
  style,
  watermarkOverride,
  forceWatermark,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  watermarkOverride?: string;
  forceWatermark?: boolean;
}) {
  const { isShieldTriggered, watermarkText, showWatermark } = usePhotoProtection();
  const displayWatermark = forceWatermark ?? showWatermark;
  const label = watermarkOverride || watermarkText;

  return (
    <div
      data-protected-photo="true"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className="relative w-full h-full overflow-hidden select-none"
    >
      {/* Immagine Reale (oscurata a livello di pixel se lo scudo scatta) */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        className={`showly-protected-media ${className} ${
          isShieldTriggered ? "blur-3xl brightness-0 opacity-0" : ""
        }`}
        style={style}
      />

      {/* Pattern Anti-Moiré & Filigrana Forense Dinamica contro Registrazioni Esterne / Telecamere */}
      {displayWatermark && !isShieldTriggered && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex flex-col justify-between p-3 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-32deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 18px)",
          }}
        >
          <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-[0.2em] text-white/70 -rotate-12 translate-y-4 select-none">
            <span>{label}</span>
          </div>
          <div className="flex justify-center items-center text-[9px] font-mono uppercase tracking-[0.22em] text-amber-200/80 -rotate-12 select-none text-center">
            <span>🔒 {label}</span>
          </div>
          <div className="flex justify-end items-center text-[8px] font-mono uppercase tracking-[0.2em] text-white/70 -rotate-12 -translate-y-4 select-none">
            <span>VIETATA LA COPIA • SHOWLY VAULT</span>
          </div>
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
