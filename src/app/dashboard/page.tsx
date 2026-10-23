"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Search,
  Settings,
  Sliders,
  Gem,
  Package,
  Lock,
} from "lucide-react";

interface Reservation {
  id: string;
  nomeCliente: string;
  whatsapp: string;
  titoloPezzo: string;
  specifica: string | null;
  prezzo: string | null;
  stato: "IN_ATTESA" | "PRONTO" | "RITIRATO" | "SCADUTO";
  note: string | null;
  dataScadenza: string;
  createdAt: string;
}

export default function DashboardOverviewPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStato, setFilterStato] = useState<string>("ALL");

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reserve");
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStato: string) => {
    try {
      const res = await fetch("/api/reserve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stato: newStato }),
      });
      if (res.ok) {
        loadReservations();
      }
    } catch {
      alert("Errore aggiornamento stato");
    }
  };

  const handleOpenWhatsAppChat = (r: Reservation) => {
    const cleanPhone = r.whatsapp.replace(/[^0-9]/g, "");
    let msg = `Salve ${r.nomeCliente}! Ti contattiamo da Atelier Aurora in merito alla creazione "${r.titoloPezzo}" che hai riservato.`;
    if (r.stato === "PRONTO") {
      msg = `Salve ${r.nomeCliente}! La creazione "${r.titoloPezzo}" è pronta in bottega per la tua prova esclusiva. Ti aspettiamo!`;
    }
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.nomeCliente.toLowerCase().includes(search.toLowerCase()) ||
      r.titoloPezzo.toLowerCase().includes(search.toLowerCase()) ||
      r.whatsapp.includes(search);
    const matchFilter = filterStato === "ALL" || r.stato === filterStato;
    return matchSearch && matchFilter;
  });

  const countInAttesa = reservations.filter((r) => r.stato === "IN_ATTESA").length;
  const countPronto = reservations.filter((r) => r.stato === "PRONTO").length;
  const countRitirato = reservations.filter((r) => r.stato === "RITIRATO").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Intestazione Principale Standard Taaaac */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <span>💎 Bottega d&apos;Autore &amp; Showroom</span>
            <span>•</span>
            <span>Click &amp; Reserve 24h</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Gem className="w-7 h-7 text-amber-500" />
            Camerino 24h &amp; Prenotazioni Pezzi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestisci i pezzi bloccati online dai clienti per la prova gratuita in bottega entro 24 ore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/catalogo"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Archivio &amp; Foto</span>
          </Link>
          <Link
            href="/dashboard/cassaforte"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Cassaforte VIP</span>
          </Link>
          <Link
            href="/dashboard/studio"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Live Studio</span>
          </Link>
          <Link
            href="/dashboard/impostazioni"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Impostazioni</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Da Preparare (Nuove)
            </span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">{countInAttesa}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Bloccate per 24 ore</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Pronte in Bottega
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">{countPronto}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">In attesa visita cliente</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Ritirate / Concluse
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{countRitirato}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Prove completate in sede</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra Ricerca e Filtri */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca cliente, creazione o telefono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Tutte" },
            { id: "IN_ATTESA", label: "In Attesa" },
            { id: "PRONTO", label: "Pronte in Bottega" },
            { id: "RITIRATO", label: "Ritirate" },
            { id: "SCADUTO", label: "Scadute" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStato(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStato === f.id
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista Prenotazioni Camerino */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Caricamento prenotazioni camerino...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Nessuna prenotazione trovata</p>
            <p className="text-xs text-slate-400">
              I pezzi bloccati dai clienti con &ldquo;Metti da Parte (24h)&rdquo; compariranno qui in tempo reale.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.stato === "IN_ATTESA"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : r.stato === "PRONTO"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : r.stato === "RITIRATO"
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {r.stato === "IN_ATTESA"
                        ? "⏳ Da Preparare"
                        : r.stato === "PRONTO"
                        ? "✨ Pronto in Bottega"
                        : r.stato === "RITIRATO"
                        ? "✓ Ritirato / Venduto"
                        : "✕ Scaduto"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Scadenza 24h: {new Date(r.dataScadenza).toLocaleString("it-IT")}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">
                    {r.titoloPezzo}{" "}
                    {r.prezzo && <span className="text-amber-600 font-bold ml-1">({r.prezzo})</span>}
                  </h3>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      👤 Cliente: <strong className="text-slate-900">{r.nomeCliente}</strong>
                    </span>
                    <span>
                      📱 WhatsApp: <strong className="font-mono text-slate-800">{r.whatsapp}</strong>
                    </span>
                    {r.note && (
                      <span className="text-slate-500 italic">💬 &ldquo;{r.note}&rdquo;</span>
                    )}
                  </div>
                </div>

                {/* Azioni Rapide */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenWhatsAppChat(r)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Avvisa su WhatsApp</span>
                  </button>

                  {r.stato === "IN_ATTESA" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "PRONTO")}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition cursor-pointer"
                    >
                      Segna Pronto in Bottega
                    </button>
                  )}

                  {(r.stato === "IN_ATTESA" || r.stato === "PRONTO") && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "RITIRATO")}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Segna Ritirato ✓
                    </button>
                  )}

                  {r.stato !== "SCADUTO" && r.stato !== "RITIRATO" && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, "SCADUTO")}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-semibold transition cursor-pointer"
                    >
                      Svincola
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
