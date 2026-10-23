"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Sparkles,
  Clock,
  AlertTriangle,
  KeyRound,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ShowlyModuleIcon } from "@/components/common/TaaaacLogo";
import ReserveModal from "@/components/ReserveModal";
import FloatingWhatsAppWidget from "@/components/FloatingWhatsAppWidget";
import { DEFAULT_SHOWLY_CONFIG } from "@/lib/config";
import type { ArticoloDTO } from "@/app/api/catalogo/route";

export default function CassaforteClientePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [requiresPin, setRequiresPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blockedStatus, setBlockedStatus] = useState<string | null>(null);

  const [invito, setInvito] = useState<{
    token: string;
    nomeDestinatario: string;
    notaRiservata: string;
    mostraPrezzi: boolean;
    scadenza: string;
    apertureEffettuate: number;
    maxAperture: number;
  } | null>(null);
  const [articoli, setArticoli] = useState<ArticoloDTO[]>([]);
  const [brandName, setBrandName] = useState(DEFAULT_SHOWLY_CONFIG.brand.name);
  const [whatsappPhone, setWhatsappPhone] = useState(
    DEFAULT_SHOWLY_CONFIG.atelier.whatsappButtonText
  );

  // Galleria multi-foto per ogni card
  const [activePhotoIndex, setActivePhotoIndex] = useState<Record<string, number>>({});

  // Modale Prenotazione Riservata
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  const getDeviceFingerprint = () => {
    if (typeof window === "undefined") return "server";
    let fp = localStorage.getItem("showly_vault_device_fp");
    if (!fp) {
      fp = `fp-${Math.random().toString(36).substring(2, 12)}-${Date.now()}`;
      localStorage.setItem("showly_vault_device_fp", fp);
    }
    return fp;
  };

  const verifyVaultAccess = async (submittedPin?: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const fp = getDeviceFingerprint();
      const urlParams = new URLSearchParams({
        token,
        fp,
      });
      if (submittedPin) urlParams.set("pin", submittedPin);

      const res = await fetch(`/api/cassaforte?${urlParams.toString()}`);
      const data = await res.json();

      if (res.status === 401 && data.requiresPin) {
        setRequiresPin(true);
        setErrorMsg(data.error || "PIN non valido");
        if (data.nomeDestinatario) {
          setInvito((prev) =>
            prev || {
              token,
              nomeDestinatario: data.nomeDestinatario,
              notaRiservata: "",
              mostraPrezzi: true,
              scadenza: data.scadenza || new Date().toISOString(),
              apertureEffettuate: 0,
              maxAperture: 10,
            }
          );
        }
        return;
      }

      if (!res.ok) {
        setBlockedStatus(data.status || "BLOCKED");
        setErrorMsg(data.error || "Accesso non disponibile.");
        return;
      }

      if (data.requiresPin) {
        setRequiresPin(true);
        if (data.brandName) setBrandName(data.brandName);
        setInvito({
          token,
          nomeDestinatario: data.nomeDestinatario || "Ospite Riservato",
          notaRiservata: "",
          mostraPrezzi: true,
          scadenza: data.scadenza || new Date().toISOString(),
          apertureEffettuate: 0,
          maxAperture: 10,
        });
        return;
      }

      setRequiresPin(false);
      setBlockedStatus(null);
      setInvito(data.invito);
      setArticoli(data.articoli || []);
      if (data.brand?.name) setBrandName(data.brand.name);
      if (data.atelier?.whatsappButtonText) {
        setWhatsappPhone(data.atelier.whatsappButtonText);
      }
    } catch {
      setErrorMsg("Errore di connessione durante la verifica della Cassaforte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const initialPin = sp.get("pin") || "";
      if (initialPin) setPinInput(initialPin);
      verifyVaultAccess(initialPin || undefined);
    }
  }, [token]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyVaultAccess(pinInput);
  };

  // 1. Schermata Bloccata / Scaduta / Dispositivo Non Autorizzato
  if (blockedStatus) {
    return (
      <div className="min-h-screen bg-luxe-black text-luxe-light flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-luxe-card border border-white/10 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 block">
            Sicurezza Cassaforte Showly
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-white">
            Accesso Riservato Non Disponibile
          </h1>
          <p className="text-xs text-luxe-sub leading-relaxed">{errorMsg}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna alla Vetrina Pubblica</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Portellone Digitale Richiesta PIN
  if (requiresPin) {
    return (
      <div className="min-h-screen bg-luxe-black text-luxe-light flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-luxe-card border border-amber-400/30 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="flex justify-center">
            <ShowlyModuleIcon size={60} />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 block mb-1">
              {brandName} • Cassaforte Privata
            </span>
            <h1 className="font-serif-luxury text-3xl font-bold text-white">
              Benvenuto/a, {invito?.nomeDestinatario || "Ospite VIP"}
            </h1>
            <p className="text-xs text-luxe-sub mt-2 leading-relaxed">
              Inserisca il Suo codice PIN personale per sbloccare le creazioni selezionate in esclusiva per Lei.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                inputMode="numeric"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Inserisci PIN (es. 2026)"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-center font-mono text-lg tracking-[0.35em] text-amber-300 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              {loading ? "Verifica in corso..." : "🔓 Sblocca Cassaforte Riservata"}
            </button>
          </form>

          <p className="text-[10px] text-luxe-sub/70 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accesso protetto e vincolato al destinatario</span>
          </p>
        </div>
      </div>
    );
  }

  // 3. Vista Principale della Cassaforte Sbloccata
  return (
    <div className="min-h-screen bg-luxe-black text-luxe-light flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Topbar Riservata */}
      <header className="sticky top-0 z-40 nav-glass border-b border-amber-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ShowlyModuleIcon size={36} />
            <div className="min-w-0">
              <span className="font-serif-luxury text-lg sm:text-2xl font-bold text-white uppercase tracking-wider truncate block">
                {brandName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-amber-300 block truncate">
                🔒 Cassaforte Privata • Riservata a {invito?.nomeDestinatario}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Dispositivo Autorizzato
            </span>
            <Link
              href="/"
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
            >
              Vetrina Pubblica
            </Link>
          </div>
        </div>
      </header>

      {/* Messaggio di Benvenuto Personalizzato per il Destinatario */}
      <section className="py-12 sm:py-16 border-b border-white/10 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono uppercase tracking-[0.2em]">
            <Lock className="w-3 h-3" />
            <span>Catalogo Riservato • Invito #{invito?.token}</span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Selezione Esclusiva per {invito?.nomeDestinatario}
          </h1>

          {invito?.notaRiservata && (
            <p className="text-xs sm:text-sm text-luxe-sub max-w-2xl mx-auto leading-relaxed italic">
              &ldquo;{invito.notaRiservata}&rdquo;
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-luxe-sub font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Valido fino al{" "}
              {invito?.scadenza
                ? new Date(invito.scadenza).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </span>
            <span>•</span>
            <span>
              Accesso {invito?.apertureEffettuate} di{" "}
              {invito?.maxAperture === 0 ? "∞" : invito?.maxAperture}
            </span>
          </div>
        </div>
      </section>

      {/* Griglia Pezzi della Cassaforte */}
      <section className="py-12 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {loading ? (
            <div className="text-center py-16 text-sm text-luxe-sub">
              Apertura Cassaforte in corso...
            </div>
          ) : articoli.length === 0 ? (
            <div className="text-center py-16 text-sm text-luxe-sub">
              Nessun articolo presente in questa selezione riservata.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {articoli.map((item) => {
                const allPhotos = [item.fotoPrincipale, ...(item.fotoStillLife || [])];
                const currentPhotoIdx = activePhotoIndex[item.id] || 0;
                const currentPhoto = allPhotos[currentPhotoIdx] || item.fotoPrincipale;

                return (
                  <div
                    key={item.id}
                    className="group bg-luxe-card border border-amber-400/25 rounded-3xl overflow-hidden hover:border-amber-400/60 transition-all duration-300 flex flex-col shadow-2xl"
                  >
                    <div className="relative aspect-square overflow-hidden bg-black">
                      <img
                        src={currentPhoto}
                        alt={item.titolo}
                        className="w-full h-full object-cover transition-transform duration-500"
                        style={
                          currentPhotoIdx === 0
                            ? {
                                objectPosition: `${item.posX ?? 50}% ${item.posY ?? 50}%`,
                                transform: `scale(${item.zoom ?? 1})`,
                              }
                            : undefined
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Badge Caveau + Codice */}
                      <div className="absolute top-4 left-4 flex items-center gap-1.5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Pezzo Riservato</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/70 text-amber-300 border border-white/15">
                          {item.codice}
                        </span>
                      </div>

                      {/* Prezzo Riservato */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-black/75 border border-amber-400/30 text-white">
                          {invito?.mostraPrezzi && item.mostraPrezzo
                            ? item.prezzo
                            : "Quotazione Riservata"}
                        </span>
                      </div>

                      {/* Selettore Foto Multi-Angolazione */}
                      {allPhotos.length > 1 && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              setActivePhotoIndex({
                                ...activePhotoIndex,
                                [item.id]:
                                  (currentPhotoIdx - 1 + allPhotos.length) %
                                  allPhotos.length,
                              })
                            }
                            className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-amber-400 hover:text-black"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full bg-black/70 text-[10px] font-mono text-amber-300">
                            Foto {currentPhotoIdx + 1}/{allPhotos.length}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setActivePhotoIndex({
                                ...activePhotoIndex,
                                [item.id]: (currentPhotoIdx + 1) % allPhotos.length,
                              })
                            }
                            className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-amber-400 hover:text-black"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                          {item.categoria}
                        </span>
                        <h3 className="font-serif-luxury text-2xl font-bold text-white mb-2">
                          {item.titolo}
                        </h3>
                        <p className="text-xs text-luxe-sub leading-relaxed">
                          {item.specifiche}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTitle(`${item.titolo} (${item.codice} - Cassaforte VIP)`);
                          setReserveOpen(true);
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                      >
                        Richiedi Prova Riservata in Bottega →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <FloatingWhatsAppWidget phone={whatsappPhone} brandName={brandName} />

      <ReserveModal
        isOpen={reserveOpen}
        onClose={() => setReserveOpen(false)}
        config={DEFAULT_SHOWLY_CONFIG}
        preselectedTitle={selectedTitle}
      />
    </div>
  );
}
