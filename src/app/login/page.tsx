"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { ShowlyModuleIcon } from "@/components/common/TaaaacLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Honeypot anti-bot
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hn = window.location.hostname.toLowerCase();
      const isDemoDomain =
        hn.includes("vercel.app") ||
        hn.includes("cliente-demo") ||
        hn.includes("-demo") ||
        hn.startsWith("demo.");

      if (isDemoDomain) {
        setIsDemo(true);
      } else {
        fetch("/api/auth/login")
          .then((r) => r.json())
          .then((d) => setIsDemo(Boolean(d.isDemo)))
          .catch(() => setIsDemo(false));
      }
    }
  }, []);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore durante l'accesso demo");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Errore accesso demo");
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          honeypot,
          mfaToken: mfaToken.trim(),
          isBackupCode: useBackupCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.mfaRequired) {
          setMfaRequired(true);
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMsg(data.error || "Credenziali non valide o accesso bloccato.");
      }
    } catch {
      setErrorMsg("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-luxe-black text-luxe-light selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-md bg-luxe-card border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"></div>

        {/* Intestazione */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShowlyModuleIcon size={56} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-400/90 font-mono block mb-1">
            Area Riservata Esercente
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-white tracking-tight">
            Accedi a Showly
          </h1>
          <p className="text-xs text-luxe-sub mt-2 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Gestisci la vetrina, il camerino 24h e le creazioni</span>
          </p>
        </div>

        {/* Messaggio di Errore */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Demo Box (Visibile SOLO su ambiente Demo Vercel / cliente-demo) */}
        {isDemo && !mfaRequired && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Modalità Demo Attiva</span>
            </div>
            <p className="text-[11px] text-luxe-sub leading-relaxed">
              Esplora il Desk &ldquo;Metti da Parte 24h&rdquo; e il Live Showcase Studio con un singolo click, senza inserire credenziali.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{demoLoading ? "Accesso Demo in corso..." : "👉 Accedi alla Demo (1-Click)"}</span>
            </button>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold text-luxe-sub/60 uppercase tracking-wider">
                oppure con credenziali
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Honeypot Invisibile per Bot */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="hp_website"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          {!mfaRequired ? (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-luxe-light block mb-1.5">
                  Email Esercente
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@atelieraurora.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-luxe-sub/40 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-luxe-light block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-luxe-sub/40 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 animate-in fade-in">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Verifica a Due Fattori Richiesta</span>
              </div>
              <p className="text-xs text-luxe-sub">
                {useBackupCode
                  ? "Inserisci uno degli 8 codici di emergenza:"
                  : "Inserisci il codice a 6 cifre mostrato sull'app Google Authenticator:"}
              </p>

              <input
                type="text"
                required
                maxLength={useBackupCode ? 10 : 6}
                placeholder={useBackupCode ? "ABCD-EF23" : "123456"}
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/80 border border-amber-400/40 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-amber-300"
              />

              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setMfaToken("");
                }}
                className="text-[11px] text-amber-400 hover:text-white transition-colors block text-center w-full"
              >
                {useBackupCode
                  ? "Usa codice da Google Authenticator"
                  : "Non hai il telefono? Usa un codice di emergenza"}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
          >
            <span>{loading ? "Accesso in corso..." : mfaRequired ? "Verifica e Accedi" : "Accedi al Gestionale"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <Link
            href="/"
            className="text-xs text-luxe-sub hover:text-white transition-colors"
          >
            ← Torna alla Vetrina Pubblica
          </Link>
        </div>

      </div>
    </div>
  );
}
