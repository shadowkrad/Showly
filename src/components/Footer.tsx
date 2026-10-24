"use client";

import { useState, useEffect } from "react";
import { ShowlyConfig } from "@/lib/config";
import { ShowlyModuleIcon } from "@/components/common/TaaaacLogo";
import { Mail, CheckCircle2, Sparkles, Send, ShieldCheck } from "lucide-react";

interface FooterProps {
  config: ShowlyConfig;
  isMobilePreview?: boolean;
}

export default function Footer({ config, isMobilePreview = false }: FooterProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [nome, setNome] = useState("");
  const [sponsorDetected, setSponsorDetected] = useState<string | null>(null);
  const [campagnaDetected, setCampagnaDetected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rileva sponsor o referral dai parametri URL (?ref=... ?sponsor=... ?utm_source=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sp =
        params.get("sponsor") ||
        params.get("utm_source") ||
        params.get("source") ||
        (params.get("ref") ? `Referral: ${params.get("ref")}` : null);
      const camp = params.get("campagna") || params.get("utm_campaign") || null;
      if (sp) setSponsorDetected(sp);
      if (camp) setCampagnaDetected(camp);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const isEmail = emailOrPhone.includes("@");
    const payload = {
      nome: nome.trim() || null,
      email: isEmail ? emailOrPhone.trim() : null,
      telefono: !isEmail ? emailOrPhone.trim() : null,
      sponsor: sponsorDetected || "Diretto (Sito Web)",
      campagna: campagnaDetected || "Iscrizione Newsletter Footer",
      consensoPrivacy: true,
    };

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          data.message ||
            "Iscrizione completata con successo! Benvenuto nel cerchio esclusivo."
        );
        setEmailOrPhone("");
        setNome("");
      } else {
        setErrorMsg(data.error || "Impossibile completare l'iscrizione.");
      }
    } catch {
      setErrorMsg("Errore di connessione. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="mt-auto border-t border-white/10 bg-black/85 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Modulo Iscrizione Club Privato & Newsletter */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" />
            <span>Club Privato & Newsletter</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Selezioni Riservate & Inviti Esclusivi
            </h3>
            <p className="text-xs sm:text-sm text-luxe-sub max-w-xl mx-auto leading-relaxed">
              Ricevi in anteprima le nuove collezioni d&apos;autore, gli inviti agli eventi e l&apos;accesso prioritario alla nostra Cassaforte Privata.
            </p>
          </div>

          {sponsorDetected && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-amber-400/30 text-amber-300 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Invito Partner Riconosciuto: {sponsorDetected}</span>
            </div>
          )}

          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center justify-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3 max-w-lg mx-auto">
              <div
                className={`flex ${
                  isMobilePreview ? "flex-col gap-2" : "flex-col sm:flex-row gap-2"
                }`}
              >
                <input
                  type="text"
                  placeholder="Il tuo nome (facoltativo)"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-amber-400/60 text-center sm:text-left sm:w-1/3"
                />
                <input
                  type="text"
                  required
                  placeholder="Email o numero WhatsApp"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-amber-400/60 text-center sm:text-left"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-lg active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "..." : "Iscriviti"}</span>
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 text-center">{errorMsg}</p>
              )}

              <p className="text-[10px] text-luxe-sub/70 text-center">
                Iscrivendoti accetti di ricevere comunicazioni d&apos;eccellenza. Nessun invio invasivo, cancellazione in qualsiasi momento con un click.
              </p>
            </form>
          )}
        </div>

        {/* Separatore */}
        <div className="border-t border-white/5 pt-8">
          <div
            className={`flex ${
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
        </div>
      </div>
    </footer>
  );
}
