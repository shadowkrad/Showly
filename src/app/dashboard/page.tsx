"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
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
    let msg = `Salve ${r.nomeCliente}! Ti contattiamo da Atelier Aurora in merito al pezzo ${r.titoloPezzo} che hai riservato.`;
    if (r.stato === "PRONTO") {
      msg = `Salve ${r.nomeCliente}! Il pezzo ${r.titoloPezzo} è pronto in bottega ad Arezzo per la tua prova esclusiva. Ti aspettiamo!`;
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
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl">
      
      {/* Intestazione */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
            Gestione Showroom & Bottega
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif-luxury">
            Desk Prenotazioni &ldquo;Metti da Parte (24h)&rdquo;
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadReservations}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-colors"
          >
            Aggiorna Dati
          </button>
        </div>
      </div>

      {/* Schede Metriche in Evidenza */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-luxe-card border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block mb-1">
              In Attesa di Preparazione
            </span>
            <span className="text-3xl font-bold text-white font-serif-luxury">
              {countInAttesa}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-luxe-card border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-1">
              Pronti per la Prova
            </span>
            <span className="text-3xl font-bold text-white font-serif-luxury">
              {countPronto}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-luxe-card border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider block mb-1">
              Completati / Venduti
            </span>
            <span className="text-3xl font-bold text-white font-serif-luxury">
              {countRitirato}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra Ricerca & Filtri */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-luxe-sub absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cerca cliente, pezzo o cellulare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-luxe-sub text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          {["ALL", "IN_ATTESA", "PRONTO", "RITIRATO"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStato(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterStato === st
                  ? "bg-amber-400 text-black font-bold"
                  : "bg-white/5 text-luxe-sub hover:text-white"
              }`}
            >
              {st === "ALL" ? "Tutti" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tabella Prenotazioni Camerino 24h */}
      <div className="bg-luxe-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 border-b border-white/10 text-luxe-sub uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Cliente & Contatto</th>
                <th className="p-4">Creazione Riservata</th>
                <th className="p-4">Scadenza Blocco</th>
                <th className="p-4">Stato Richiesta</th>
                <th className="p-4 text-right">Azioni Rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-luxe-sub">
                    Caricamento prenotazioni...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-luxe-sub">
                    Nessuna richiesta trovata.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{r.nomeCliente}</div>
                      <div className="text-luxe-sub font-mono">{r.whatsapp}</div>
                      {r.note && (
                        <div className="text-[11px] text-amber-300/80 italic mt-1">
                          &ldquo;{r.note}&rdquo;
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{r.titoloPezzo}</div>
                      <div className="text-luxe-sub">{r.specifica || "Creazione d'autore"}</div>
                    </td>
                    <td className="p-4 font-mono text-luxe-sub">
                      {new Date(r.dataScadenza).toLocaleString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <select
                        value={r.stato}
                        onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="IN_ATTESA">⏳ In Attesa</option>
                        <option value="PRONTO">✨ Pronto per Prova</option>
                        <option value="RITIRATO">✅ Ritirato / Venduto</option>
                        <option value="SCADUTO">❌ Scaduto</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenWhatsAppChat(r)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-flex items-center space-x-1.5 transition-all"
                        title="Invia messaggio WhatsApp al cliente"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Notifica WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
