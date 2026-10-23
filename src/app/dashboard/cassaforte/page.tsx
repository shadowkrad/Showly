"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Send,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
  Smartphone,
  Clock,
  Eye,
  CheckCircle2,
  RotateCcw,
  KeyRound,
  Sparkles,
} from "lucide-react";
import type { InvitoCassaforteDTO } from "@/app/api/cassaforte/route";
import type { ArticoloDTO } from "@/app/api/catalogo/route";

export default function CassaforteManagerPage() {
  const [inviti, setInviti] = useState<InvitoCassaforteDTO[]>([]);
  const [articoli, setArticoli] = useState<ArticoloDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form Nuovo Invito Cassaforte
  const [nomeDestinatario, setNomeDestinatario] = useState("");
  const [whatsappDestinatario, setWhatsappDestinatario] = useState("");
  const [pinAccesso, setPinAccesso] = useState("2026");
  const [durataOre, setDurataOre] = useState(48);
  const [maxAperture, setMaxAperture] = useState(10);
  const [vincolaDispositivo, setVincolaDispositivo] = useState(true);
  const [mostraPrezzi, setMostraPrezzi] = useState(true);
  const [notaRiservata, setNotaRiservata] = useState(
    "Abbiamo selezionato per Lei queste creazioni esclusive custodite nella nostra Cassaforte privata. Può richiedere la visione riservata in bottega con un semplice click."
  );
  const [selectedArticoliIds, setSelectedArticoliIds] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cassaforte");
      if (res.ok) {
        const data = await res.json();
        setInviti(data.inviti || []);
        const arts: ArticoloDTO[] = data.articoli || [];
        setArticoli(arts);
        // Preseleziona di default gli articoli marcati CASSAFORTE
        const vaultIds = arts
          .filter((a) => a.visibilita === "CASSAFORTE")
          .map((a) => a.id);
        setSelectedArticoliIds(vaultIds);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setPinAccesso(pin);
  };

  const toggleArticoloSelection = (id: string) => {
    setSelectedArticoliIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateInvito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeDestinatario.trim()) {
      alert("Inserisci il nome del cliente destinatario.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/cassaforte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeDestinatario,
          whatsappDestinatario,
          pinAccesso,
          durataOre,
          maxAperture,
          vincolaDispositivo,
          mostraPrezzi,
          notaRiservata,
          articoliIds: selectedArticoliIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInviti(data.inviti || []);
        setNomeDestinatario("");
        setWhatsappDestinatario("");
        generateRandomPin();
        showToast("Invito Cassaforte creato! Ora puoi inviarlo su WhatsApp con 1 click.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAttivo = async (inv: InvitoCassaforteDTO) => {
    const res = await fetch("/api/cassaforte", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id, attivo: !inv.attivo }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviti(data.inviti || []);
      showToast(
        !inv.attivo
          ? "Accesso Cassaforte riattivato."
          : "Accesso Cassaforte revocato e bloccato."
      );
    }
  };

  const handleResetDevice = async (inv: InvitoCassaforteDTO) => {
    const res = await fetch("/api/cassaforte", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id, resetDevice: true, resetViews: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviti(data.inviti || []);
      showToast("Vincolo dispositivo e contatore aperture azzerati.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo invito Cassaforte?")) return;
    const res = await fetch(`/api/cassaforte?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      setInviti(data.inviti || []);
      showToast("Invito eliminato.");
    }
  };

  const getVaultUrl = (token: string) => {
    if (typeof window === "undefined") return `/cassaforte/${token}`;
    return `${window.location.origin}/cassaforte/${token}`;
  };

  const handleCopyLink = (inv: InvitoCassaforteDTO) => {
    const url = getVaultUrl(inv.token);
    const text = inv.pinAccesso
      ? ` Catalogo Privato Cassaforte riservato per ${inv.nomeDestinatario}: ${url} (PIN personale: ${inv.pinAccesso})`
      : `${url}`;
    navigator.clipboard.writeText(text.trim());
    showToast("Link e PIN copiati negli appunti!");
  };

  const handleSendWhatsApp = (inv: InvitoCassaforteDTO) => {
    const url = getVaultUrl(inv.token);
    const cleanPhone = inv.whatsappDestinatario.replace(/[^0-9]/g, "");
    const pinLine = inv.pinAccesso
      ? `\n🔑 *Codice PIN Personale:* ${inv.pinAccesso}`
      : "";
    const msg = `Gentile *${inv.nomeDestinatario}*, abbiamo preparato per Lei un accesso riservato alla nostra *Cassaforte Privata* con le creazioni selezionate:\n\n🔗 *Link Personale:* ${url}${pinLine}\n\n🔒 _L'accesso è strettamente personale e riservato al Suo dispositivo._`;

    const waLink = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waLink, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header Cassaforte */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              Catalogo Privato &ldquo;Cassaforte&rdquo; • Accesso Riservato
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Cassaforte VIP &amp; Inviti Limitati al Destinatario
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Crea un catalogo segreto su misura per un singolo cliente o buyer: protetto da <strong>PIN personale</strong>, <strong>scadenza oraria</strong>, <strong>limite di aperture</strong> e <strong>blocco automatico sul dispositivo di chi lo riceve</strong> per impedire l&apos;inoltro a estranei.
            </p>
          </div>

          <Link
            href="/dashboard/catalogo"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-amber-300 text-xs font-bold transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gestisci Articoli in Archivio ({articoli.length})</span>
          </Link>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* COLONNA SINISTRA (5 COL): GENERATORE NUOVO INVITO CASSAFORTE */}
        <form
          onSubmit={handleCreateInvito}
          className="xl:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Genera Nuovo Invito Cassaforte</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura il destinatario e seleziona le creazioni riservate da mostrargli.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome Cliente / Destinatario *
              </label>
              <input
                type="text"
                required
                value={nomeDestinatario}
                onChange={(e) => setNomeDestinatario(e.target.value)}
                placeholder="es. Sig.ra Elena Conti"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cellulare WhatsApp Destinatario
              </label>
              <input
                type="tel"
                value={whatsappDestinatario}
                onChange={(e) => setWhatsappDestinatario(e.target.value)}
                placeholder="es. +39 340 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Parametri Sicurezza: PIN, Durata, Max Aperture */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PIN Segreto
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={pinAccesso}
                    onChange={(e) => setPinAccesso(e.target.value)}
                    placeholder="2026"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPin}
                    className="px-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold cursor-pointer"
                    title="Genera nuovo PIN"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Validità Link
                </label>
                <select
                  value={durataOre}
                  onChange={(e) => setDurataOre(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value={24}>24 Ore</option>
                  <option value={48}>48 Ore</option>
                  <option value={168}>7 Giorni</option>
                  <option value={720}>30 Giorni</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Max Aperture
                </label>
                <select
                  value={maxAperture}
                  onChange={(e) => setMaxAperture(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value={3}>Max 3 aperture</option>
                  <option value={5}>Max 5 aperture</option>
                  <option value={10}>Max 10 aperture</option>
                  <option value={0}>Illimitate</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-2 border-t border-slate-200 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={vincolaDispositivo}
                onChange={(e) => setVincolaDispositivo(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  🔒 Vincola al Dispositivo del Destinatario (Anti-Inoltro)
                </span>
                <span className="text-[11px] text-slate-500">
                  Alla prima apertura il catalogo si lega allo smartphone/PC del cliente: se inoltra il link ad altri, l&apos;accesso viene bloccato.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 pt-2 border-t border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={mostraPrezzi}
                onChange={(e) => setMostraPrezzi(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>Mostra i prezzi riservati all&apos;interno della Cassaforte</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Messaggio di Benvenuto Dedicato al Cliente
            </label>
            <textarea
              rows={2}
              value={notaRiservata}
              onChange={(e) => setNotaRiservata(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* Selezione Articoli da Includere nella Cassaforte */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Seleziona i Pezzi da Inserire ({selectedArticoliIds.length} scelti)
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedArticoliIds(
                    selectedArticoliIds.length === articoli.length
                      ? []
                      : articoli.map((a) => a.id)
                  )
                }
                className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
              >
                {selectedArticoliIds.length === articoli.length
                  ? "Deseleziona tutti"
                  : "Seleziona tutti"}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl p-2 space-y-1.5 bg-slate-50">
              {articoli.map((art) => {
                const checked = selectedArticoliIds.includes(art.id);
                return (
                  <label
                    key={art.id}
                    onClick={() => toggleArticoloSelection(art.id)}
                    className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "bg-amber-50 border-amber-400 shadow-2xs"
                        : "bg-white border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <img
                      src={art.fotoPrincipale}
                      alt={art.titolo}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-900"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {art.titolo}
                        </span>
                        {art.visibilita === "CASSAFORTE" && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 text-[9px] font-bold uppercase shrink-0">
                            Caveau
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {art.codice} • {art.prezzo}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? "Creazione in corso..." : "🔐 Crea Catalogo Privato Cassaforte"}</span>
          </button>
        </form>

        {/* COLONNA DESTRA (7 COL): ELENCO INVITI CASSAFORTE ATTIVI & MONITORAGGIO */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">
              Inviti Cassaforte Attivi &amp; Monitoraggio Accessi ({inviti.length})
            </h2>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-500">
              Caricamento inviti Cassaforte...
            </div>
          ) : inviti.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-500">
              Nessun invito Cassaforte creato. Compila il modulo a sinistra per inviare il primo catalogo privato.
            </div>
          ) : (
            <div className="space-y-4">
              {inviti.map((inv) => {
                const isExpired = new Date(inv.scadenza).getTime() < Date.now();
                const isLimitReached =
                  inv.maxAperture > 0 && inv.apertureEffettuate >= inv.maxAperture;

                return (
                  <div
                    key={inv.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-slate-900">
                            {inv.nomeDestinatario}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-400 font-mono text-xs font-bold">
                            {inv.token}
                          </span>
                          {inv.pinAccesso && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-bold">
                              PIN: {inv.pinAccesso}
                            </span>
                          )}
                          {inv.attivo && !isExpired && !isLimitReached ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                              ● Attivo
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                              ● Chiuso / Scaduto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {inv.notaRiservata}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/cassaforte/${inv.token}${
                            inv.pinAccesso ? `?pin=${inv.pinAccesso}` : ""
                          }`}
                          target="_blank"
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5"
                          title="Apri anteprima della Cassaforte"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Apri Cassaforte</span>
                        </Link>
                      </div>
                    </div>

                    {/* Metriche di Controllo Accesso */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Eye className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Aperture Cliente
                          </span>
                          <span className="font-bold text-slate-900">
                            {inv.apertureEffettuate} /{" "}
                            {inv.maxAperture === 0 ? "∞" : inv.maxAperture}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Blocco Dispositivo
                          </span>
                          <span className="font-bold text-slate-900">
                            {inv.vincolaDispositivo
                              ? inv.deviceFingerprint
                                ? "Agganciato al Cliente 🔒"
                                : "In attesa 1ª apertura"
                              : "Libero"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Scadenza Link
                          </span>
                          <span className="font-bold text-slate-900">
                            {new Date(inv.scadenza).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Azioni Rapide: WhatsApp 1-Click, Copia Link, Reset Dispositivo, Revoca */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(inv)}
                          className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Invia su WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv)}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copia Link &amp; PIN</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetDevice(inv)}
                          className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Sblocca dispositivo e azzera aperture"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Sblocca Dispositivo</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleAttivo(inv)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                            inv.attivo
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                              : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                          }`}
                        >
                          {inv.attivo ? "Sospendi Link" : "Riattiva Link"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                          title="Elimina invito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
