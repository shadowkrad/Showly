"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  KeyRound,
  Delete,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { ShowlyModuleIcon } from "@/components/common/TaaaacLogo";

export default function LoginPage() {
  const router = useRouter();

  // Tab di selezione: Titolare vs Staff PIN
  const [loginMode, setLoginMode] = useState<"titolare" | "pin">("titolare");

  // Credenziali Titolare
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Credenziali Staff
  const [pin, setPin] = useState("");

  const [honeypot, setHoneypot] = useState("");
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

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setErrorMsg("");
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

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
      if (!res.ok) throw new Error(data.error || "Errore durante l'accesso demo");

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Errore accesso demo");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (loginMode === "titolare") {
      if (!email.trim() || !password) {
        setErrorMsg("Inserisci l'indirizzo email e la password dell'account.");
        return;
      }
    } else {
      if (!pin || pin.length < 4) {
        setErrorMsg("Inserisci il PIN di almeno 4 cifre per accedere.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = { honeypot };
      if (loginMode === "titolare") {
        payload.email = email.trim();
        payload.password = password;
      } else {
        payload.pin = pin;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenziali non valide");
      }

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Si è verificato un errore durante l'accesso.");
      if (loginMode === "pin") setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Sfondo luminoso con bagliore */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Torna alla vetrina */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Vetrina Showroom
          </Link>
        </div>

        {/* Card Contenitore */}
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3 shadow-inner">
              <ShowlyModuleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Accesso Gestionale
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Area riservata al titolare e agli operatori showroom
            </p>
          </div>

          {/* Banner Demo 1-Click */}
          {isDemo && (
            <div className="mb-6 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Ambiente Demo Interattivo
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {demoLoading ? "Accesso in corso..." : "Entra come Titolare Demo (1-Click)"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Banner Errore */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Selettore Tab di Login */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/60 border border-slate-800 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode("titolare");
                setErrorMsg("");
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === "titolare"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Titolare (Email)
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("pin");
                setErrorMsg("");
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === "pin"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Staff (PIN)
            </button>
          </div>

          {/* FORM 1: TITOLARE CON EMAIL E PASSWORD */}
          {loginMode === "titolare" ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Campo Honeypot invisibile anti-bot */}
              <input
                type="text"
                name="honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Account Titolare
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="showroom@brand.it"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {loading ? "Verifica in corso..." : "Accedi alla Dashboard"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <a
                  href="https://taaaac.eu/portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition"
                >
                  Password dimenticata o gestisci credenziali?
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </form>
          ) : (
            /* FORM 2: STAFF SHOWROOM CON PIN TOUCH */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-2">
                  Inserisci il PIN rapido a 4 cifre per accedere alla postazione showroom o ai cataloghi
                </p>

                {/* Pallini Cifre Mascherate */}
                <div className="flex items-center justify-center gap-3 py-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        pin.length > idx
                          ? "bg-purple-500 border-purple-500 scale-110 shadow-sm shadow-purple-500/50"
                          : "border-slate-700 bg-slate-950"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Tastierino Touch */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handlePinDigit(digit)}
                    className="h-12 bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-slate-700/60 rounded-xl text-base font-bold text-white transition flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin("")}
                  className="h-12 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 transition flex items-center justify-center cursor-pointer"
                >
                  Cancella
                </button>
                <button
                  type="button"
                  onClick={() => handlePinDigit("0")}
                  className="h-12 bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-slate-700/60 rounded-xl text-base font-bold text-white transition flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinDelete}
                  className="h-12 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 transition flex items-center justify-center cursor-pointer"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading || pin.length < 4}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-purple-600/20"
              >
                {loading ? "Verifica PIN..." : "Sblocca Postazione"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Informativo */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Autenticazione protetta e monitorata con Taaaac Cloud Security.
        </div>
      </div>
    </div>
  );
}
