"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Laptop,
  Smartphone,
  Tablet,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  Lock,
} from "lucide-react";

interface TrustedDevice {
  id: string;
  deviceName: string;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
}

interface AccessLog {
  id: string;
  evento: string;
  ipAddress: string;
  userAgent: string | null;
  isNewDevice: boolean;
  createdAt: string;
}

interface UserSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function UserSecurityModal({
  isOpen,
  onClose,
  userEmail,
}: UserSecurityModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"mfa" | "devices" | "logs">("mfa");
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);

  // Setup MFA state
  const [setupStep, setSetupStep] = useState<"idle" | "qr" | "confirming">("idle");
  const [secret, setSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadSecurityStatus();
  }, [isOpen]);

  const loadSecurityStatus = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/security?action=status");
      if (res.ok) {
        const data = await res.json();
        setMfaEnabled(Boolean(data.mfaEnabled));
        setDevices(data.devices || []);
        setLogs(data.logs || []);
      }
    } catch {
      setErrorMsg("Errore nel caricamento delle impostazioni di sicurezza");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/security?action=setup-mfa", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSecret(data.secret);
        setQrCodeDataUrl(data.qrCode);
        setBackupCodes(data.backupCodes || []);
        setSetupStep("qr");
      } else {
        setErrorMsg(data.error || "Impossibile avviare la configurazione MFA");
      }
    } catch {
      setErrorMsg("Errore di rete durante la configurazione");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMfa = async () => {
    if (!verifyCode || verifyCode.trim().length !== 6) {
      setErrorMsg("Inserisci il codice a 6 cifre mostrato sull'app di autenticazione");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/security?action=confirm-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verifyCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMfaEnabled(true);
        setSetupStep("idle");
        setSuccessMsg("Autenticazione a due fattori (MFA) attivata con successo!");
        loadSecurityStatus();
      } else {
        setErrorMsg(data.error || "Codice errato. Riprova con il codice attuale.");
      }
    } catch {
      setErrorMsg("Errore di verifica del token");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm("Sei sicuro di voler disattivare l'autenticazione a due fattori? Il tuo account sarà meno protetto.")) {
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/security?action=disable-mfa", { method: "POST" });
      if (res.ok) {
        setMfaEnabled(false);
        setSuccessMsg("Autenticazione a due fattori disattivata.");
        loadSecurityStatus();
      } else {
        setErrorMsg("Errore durante la disattivazione dell'MFA");
      }
    } catch {
      setErrorMsg("Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-luxe-card border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-luxe-light">
        
        {/* Intestazione */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-serif-luxury">Centro Sicurezza & Accessi</h2>
              <p className="text-xs text-luxe-sub">Account: <span className="text-white font-mono">{userEmail}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-luxe-sub hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab di Selezione */}
        <div className="flex space-x-2 border-b border-white/10 pb-4 mb-6 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("mfa")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "mfa" ? "bg-amber-400 text-black shadow-md font-bold" : "text-luxe-sub hover:text-white bg-white/5"
            }`}
          >
            🔑 2FA / Autenticazione (MFA)
          </button>
          <button
            onClick={() => setActiveTab("devices")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "devices" ? "bg-amber-400 text-black shadow-md font-bold" : "text-luxe-sub hover:text-white bg-white/5"
            }`}
          >
            💻 Dispositivi ({devices.length})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "logs" ? "bg-amber-400 text-black shadow-md font-bold" : "text-luxe-sub hover:text-white bg-white/5"
            }`}
          >
            📋 Registro Accessi
          </button>
        </div>

        {/* Messaggi di Feedback */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: MFA */}
        {activeTab === "mfa" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white mb-1">Stato Autenticazione a Due Fattori</h4>
                <p className="text-xs text-luxe-sub">
                  Protegge il tuo negozio richiedendo un codice monouso dal telefono ad ogni accesso.
                </p>
              </div>
              <div>
                {mfaEnabled ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ATTIVO</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-luxe-sub border border-white/15">
                    NON ATTIVO
                  </span>
                )}
              </div>
            </div>

            {setupStep === "idle" && (
              <div>
                {!mfaEnabled ? (
                  <div className="space-y-4">
                    <p className="text-xs text-luxe-sub leading-relaxed">
                      L&apos;attivazione dell&apos;MFA ti permette di sincronizzare un&apos;app come <strong>Google Authenticator</strong> o <strong>1Password</strong>. Riceverai anche 8 codici di emergenza usa-e-getta.
                    </p>
                    <button
                      onClick={handleStartSetup}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
                    >
                      {loading ? "Inizializzazione..." : "Inizia Configurazione 2FA (MFA)"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-emerald-400">
                      Il tuo account è protetto con RFC 6238 TOTP. Ogni nuovo login richiederà il codice a 6 cifre.
                    </p>
                    <button
                      onClick={handleDisableMfa}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-all"
                    >
                      Disattiva Autenticazione a Due Fattori
                    </button>
                  </div>
                )}
              </div>
            )}

            {setupStep === "qr" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code MFA" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-black text-xs">Caricamento QR...</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-white">1. Inquadra con il Telefono</h5>
                    <p className="text-xs text-luxe-sub leading-relaxed">
                      Apri Google Authenticator sul tuo smartphone e premi &ldquo;+&rdquo; per inquadrare il codice.
                    </p>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-amber-300 break-all select-all">
                      Chiave: {secret}
                    </div>
                  </div>
                </div>

                {/* Codici di emergenza */}
                <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>2. Codici di Emergenza (Salvali Ora)</span>
                    </span>
                    <button
                      onClick={copyBackupCodes}
                      className="text-xs text-amber-400 hover:text-white flex items-center space-x-1"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodes ? "Copiati!" : "Copia Codici"}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-white">
                    {backupCodes.map((c, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-black/40 text-center border border-white/5">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verifica codice per confermare */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-white block">
                    3. Inserisci il codice a 6 cifre mostrato dall&apos;app per confermare:
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="es. 123456"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-center tracking-widest text-lg w-44 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleConfirmMfa}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
                    >
                      {loading ? "Verifica..." : "Conferma e Attiva 2FA"}
                    </button>
                    <button
                      onClick={() => setSetupStep("idle")}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Dispositivi Fidati */}
        {activeTab === "devices" && (
          <div className="space-y-3">
            <p className="text-xs text-luxe-sub mb-4">
              I dispositivi da cui hai effettuato l&apos;accesso al pannello. Riceverai un&apos;email di notifica automatica ogni volta che viene rilevato un nuovo dispositivo.
            </p>
            {devices.length === 0 ? (
              <div className="text-center py-8 text-luxe-sub text-xs">Nessun dispositivo registrato</div>
            ) : (
              devices.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Laptop className="w-5 h-5 text-amber-400" />
                    <div>
                      <h5 className="font-bold text-xs text-white">{d.deviceName}</h5>
                      <p className="text-[11px] text-luxe-sub">IP: {d.ipAddress || "127.0.0.1"} • Ultimo uso: {new Date(d.lastUsedAt).toLocaleDateString("it-IT")}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Autorizzato
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Registro Accessi */}
        {activeTab === "logs" && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 no-scrollbar">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-luxe-sub text-xs">Nessun evento registrato</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className={`font-bold mr-2 ${log.evento.includes("SUCCESS") ? "text-emerald-400" : "text-rose-400"}`}>
                      {log.evento}
                    </span>
                    <span className="text-luxe-sub font-mono">IP: {log.ipAddress}</span>
                  </div>
                  <span className="text-luxe-sub text-[11px]">
                    {new Date(log.createdAt).toLocaleString("it-IT")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
