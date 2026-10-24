"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  Download,
  Sparkles,
  TrendingUp,
  Tag,
  Phone,
  Lock,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

interface Cliente {
  id: string;
  nome: string | null;
  email: string | null;
  telefono: string | null;
  sponsor: string | null;
  campagna: string | null;
  codiceReferral: string | null;
  stato: string;
  note: string | null;
  ultimoContatto: string | null;
  createdAt: string;
}

interface SponsorBreakdown {
  sponsor: string;
  count: number;
  vipCount: number;
  leadCount: number;
  percentuale: number;
}

interface Statistiche {
  totale: number;
  attivi: number;
  vip: number;
  lead: number;
  sponsorBreakdown: SponsorBreakdown[];
}

interface Campagna {
  id: string;
  titolo: string;
  oggettoEmail: string | null;
  messaggio: string;
  sponsorCorrelato: string | null;
  canale: string;
  destinatariFiltro: string;
  numeroDestinatari: number;
  stato: string;
  dataInviato: string | null;
  createdAt: string;
}

export default function ClientiNewsletterDashboardPage() {
  const [activeTab, setActiveTab] = useState<"clienti" | "campagne">("clienti");
  const [loading, setLoading] = useState(true);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [statistiche, setStatistiche] = useState<Statistiche>({
    totale: 0,
    attivi: 0,
    vip: 0,
    lead: 0,
    sponsorBreakdown: [],
  });
  const [campagne, setCampagne] = useState<Campagna[]>([]);

  // Filtri & Ricerca
  const [search, setSearch] = useState("");
  const [selectedSponsor, setSelectedSponsor] = useState("TUTTI");
  const [selectedStato, setSelectedStato] = useState("TUTTI");

  // Modali
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [modalNewsletterOpen, setModalNewsletterOpen] = useState(false);

  // Form Cliente
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formSponsor, setFormSponsor] = useState("Diretto");
  const [formCampagna, setFormCampagna] = useState("");
  const [formReferral, setFormReferral] = useState("");
  const [formStato, setFormStato] = useState("ATTIVO");
  const [formNote, setFormNote] = useState("");
  const [submittingCliente, setSubmittingCliente] = useState(false);

  // Form Campagna Newsletter
  const [campagnaTitolo, setCampagnaTitolo] = useState("");
  const [campagnaOggetto, setCampagnaOggetto] = useState("");
  const [campagnaMessaggio, setCampagnaMessaggio] = useState("");
  const [campagnaSponsor, setCampagnaSponsor] = useState("");
  const [campagnaCanale, setCampagnaCanale] = useState("EMAIL");
  const [campagnaFiltro, setCampagnaFiltro] = useState("TUTTI");
  const [submittingCampagna, setSubmittingCampagna] = useState(false);

  const fetchClienti = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedSponsor !== "TUTTI") params.set("sponsor", selectedSponsor);
      if (selectedStato !== "TUTTI") params.set("stato", selectedStato);

      const res = await fetch(`/api/newsletter/clienti?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClienti(data.clienti || []);
        setStatistiche(data.statistiche || {
          totale: 0,
          attivi: 0,
          vip: 0,
          lead: 0,
          sponsorBreakdown: [],
        });
      }
    } catch (err) {
      console.error("Errore fetch clienti:", err);
    }
  };

  const fetchCampagne = async () => {
    try {
      const res = await fetch("/api/newsletter/campagne");
      if (res.ok) {
        const data = await res.json();
        setCampagne(data.campagne || []);
      }
    } catch (err) {
      console.error("Errore fetch campagne:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchClienti(), fetchCampagne()]).finally(() => {
      setLoading(false);
    });
  }, [search, selectedSponsor, selectedStato]);

  const handleOpenNewCliente = () => {
    setEditingCliente(null);
    setFormNome("");
    setFormEmail("");
    setFormTelefono("");
    setFormSponsor("Diretto");
    setFormCampagna("");
    setFormReferral("");
    setFormStato("ATTIVO");
    setFormNote("");
    setModalClienteOpen(true);
  };

  const handleOpenEditCliente = (c: Cliente) => {
    setEditingCliente(c);
    setFormNome(c.nome || "");
    setFormEmail(c.email || "");
    setFormTelefono(c.telefono || "");
    setFormSponsor(c.sponsor || "Diretto");
    setFormCampagna(c.campagna || "");
    setFormReferral(c.codiceReferral || "");
    setFormStato(c.stato || "ATTIVO");
    setFormNote(c.note || "");
    setModalClienteOpen(true);
  };

  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCliente(true);
    try {
      if (editingCliente) {
        const res = await fetch("/api/newsletter/clienti", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCliente.id,
            nome: formNome,
            email: formEmail,
            telefono: formTelefono,
            sponsor: formSponsor,
            campagna: formCampagna,
            stato: formStato,
            note: formNote,
          }),
        });
        if (res.ok) {
          setModalClienteOpen(false);
          fetchClienti();
        }
      } else {
        const res = await fetch("/api/newsletter/clienti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: formNome,
            email: formEmail,
            telefono: formTelefono,
            sponsor: formSponsor,
            campagna: formCampagna,
            codiceReferral: formReferral,
            stato: formStato,
            note: formNote,
          }),
        });
        if (res.ok) {
          setModalClienteOpen(false);
          fetchClienti();
        }
      }
    } catch (err) {
      console.error("Errore salvataggio cliente:", err);
    } finally {
      setSubmittingCliente(false);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("Sei sicuro di voler rimuovere questo contatto dal registro?")) return;
    try {
      const res = await fetch(`/api/newsletter/clienti?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchClienti();
    } catch (err) {
      console.error("Errore cancellazione:", err);
    }
  };

  const handleSendCampagna = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCampagna(true);
    try {
      const res = await fetch("/api/newsletter/campagne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titolo: campagnaTitolo,
          oggettoEmail: campagnaOggetto,
          messaggio: campagnaMessaggio,
          sponsorCorrelato: campagnaSponsor || null,
          canale: campagnaCanale,
          destinatariFiltro: campagnaFiltro,
          inviaSubito: true,
        }),
      });
      if (res.ok) {
        setModalNewsletterOpen(false);
        setCampagnaTitolo("");
        setCampagnaOggetto("");
        setCampagnaMessaggio("");
        setCampagnaSponsor("");
        fetchCampagne();
        fetchClienti();
        setActiveTab("campagne");
      }
    } catch (err) {
      console.error("Errore invio campagna:", err);
    } finally {
      setSubmittingCampagna(false);
    }
  };

  const handleExportCSV = () => {
    if (clienti.length === 0) {
      alert("Nessun contatto da esportare.");
      return;
    }
    const headers = [
      "ID",
      "Nome",
      "Email",
      "Telefono",
      "Sponsor / Canale",
      "Campagna",
      "Codice Referral",
      "Stato",
      "Note",
      "Data Iscrizione",
    ];
    const rows = clienti.map((c) => [
      c.id,
      `"${c.nome || ""}"`,
      `"${c.email || ""}"`,
      `"${c.telefono || ""}"`,
      `"${c.sponsor || ""}"`,
      `"${c.campagna || ""}"`,
      `"${c.codiceReferral || ""}"`,
      c.stato,
      `"${(c.note || "").replace(/"/g, '""')}"`,
      new Date(c.createdAt).toLocaleDateString("it-IT"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `registro_clienti_showly_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case "VIP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Sparkles className="w-3 h-3 text-amber-600" />
            VIP
          </span>
        );
      case "ATTIVO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Attivo
          </span>
        );
      case "LEAD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            Lead
          </span>
        );
      case "DISISCRITTO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            Disiscritto
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {stato}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Intestazione Principale */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Registro Clienti & Newsletter
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Monitora i lead e i clienti acquisiti, misura il rendimento delle singole sponsorizzazioni e gestisci le newsletter dell&apos;Atelier.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Esporta CSV</span>
          </button>

          <button
            onClick={() => setModalNewsletterOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-600" />
            <span>Nuova Newsletter</span>
          </button>

          <button
            onClick={handleOpenNewCliente}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Aggiungi Contatto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Statistiche Sponsorizzazioni */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Totale Iscritti</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
            {statistiche.totale}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {statistiche.attivi} attivi nel database
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Clienti VIP</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-900">
            {statistiche.vip}
          </div>
          <div className="mt-1 text-[11px] text-amber-700/80">
            Accesso prioritario e inviti privati
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Lead & Preventivi</span>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
            {statistiche.lead}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Contatti in fase di maturazione
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Top Sponsorizzazione</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-base sm:text-lg font-bold text-slate-900 truncate">
            {statistiche.sponsorBreakdown[0]?.sponsor || "Nessuno"}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            {statistiche.sponsorBreakdown[0]
              ? `${statistiche.sponsorBreakdown[0].count} lead (${statistiche.sponsorBreakdown[0].percentuale}%)`
              : "In attesa di traffico"}
          </div>
        </div>
      </div>

      {/* Riquadro Dettaglio Performance Sponsorizzazioni */}
      {statistiche.sponsorBreakdown.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Rendimento Sponsorizzazioni & Canali di Provenienza</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Clicca su uno sponsor per filtrare i clienti
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {statistiche.sponsorBreakdown.map((sb) => {
              const isSelected = selectedSponsor === sb.sponsor;
              return (
                <button
                  key={sb.sponsor}
                  onClick={() =>
                    setSelectedSponsor(isSelected ? "TUTTI" : sb.sponsor)
                  }
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {sb.sponsor}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {sb.count} contatti
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sb.percentuale}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 font-mono">
                    <span>{sb.percentuale}% del totale</span>
                    <span>
                      {sb.vipCount > 0 && (
                        <strong className="text-amber-700 mr-2">
                          ★ {sb.vipCount} VIP
                        </strong>
                      )}
                      {sb.leadCount > 0 && (
                        <span className="text-blue-600">● {sb.leadCount} Lead</span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Switcher: Clienti vs Campagne */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("clienti")}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "clienti"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Elenco Iscritti & Sponsor ({clienti.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("campagne")}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "campagne"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Storico Newsletter & Broadcast ({campagne.length})</span>
        </button>
      </div>

      {/* VISTA 1: REGISTRO CLIENTI */}
      {activeTab === "clienti" && (
        <div className="space-y-4">
          {/* Barra di Ricerca e Filtri */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca per nome, email, telefono, sponsor o campagna..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-400 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSponsor}
                onChange={(e) => setSelectedSponsor(e.target.value)}
                className="text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="TUTTI">Tutti gli Sponsor</option>
                {statistiche.sponsorBreakdown.map((sb) => (
                  <option key={sb.sponsor} value={sb.sponsor}>
                    {sb.sponsor} ({sb.count})
                  </option>
                ))}
              </select>

              <select
                value={selectedStato}
                onChange={(e) => setSelectedStato(e.target.value)}
                className="text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="TUTTI">Tutti gli Stati</option>
                <option value="VIP">Solo VIP</option>
                <option value="ATTIVO">Solo Attivi</option>
                <option value="LEAD">Solo Lead</option>
                <option value="DISISCRITTO">Disiscritti</option>
              </select>
            </div>
          </div>

          {/* Tabella Clienti */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Cliente</th>
                    <th className="py-3.5 px-4">Contatti</th>
                    <th className="py-3.5 px-4">Sponsor / Provenienza</th>
                    <th className="py-3.5 px-4">Stato</th>
                    <th className="py-3.5 px-4">Data Iscrizione</th>
                    <th className="py-3.5 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clienti.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        Nessun contatto trovato con i filtri correnti.
                      </td>
                    </tr>
                  ) : (
                    clienti.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="font-semibold text-slate-900">
                            {c.nome || "Ospite Vetrina"}
                          </div>
                          {c.note && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {c.note}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <a
                                href={`mailto:${c.email}`}
                                className="hover:text-slate-900 underline-offset-2 hover:underline"
                              >
                                {c.email}
                              </a>
                            </div>
                          )}
                          {c.telefono && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <a
                                href={`https://wa.me/${c.telefono.replace(
                                  /[^0-9]/g,
                                  ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 font-medium"
                              >
                                {c.telefono}
                              </a>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            <Tag className="w-3 h-3 text-amber-600" />
                            {c.sponsor || "Diretto"}
                          </span>
                          {c.campagna && (
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {c.campagna}
                              {c.codiceReferral && (
                                <span className="ml-1 font-mono text-slate-500">
                                  ({c.codiceReferral})
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">{getStatoBadge(c.stato)}</td>

                        <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                          {new Date(c.createdAt).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {/* Invita in Cassaforte Privata */}
                            <Link
                              href={`/dashboard/cassaforte?nome=${encodeURIComponent(
                                c.nome || ""
                              )}&tel=${encodeURIComponent(c.telefono || "")}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Genera Invito Privato Cassaforte"
                            >
                              <Lock className="w-4 h-4" />
                            </Link>

                            {/* Modifica */}
                            <button
                              onClick={() => handleOpenEditCliente(c)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Modifica Contatto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Cancella */}
                            <button
                              onClick={() => handleDeleteCliente(c.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Rimuovi Contatto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: STORICO NEWSLETTER */}
      {activeTab === "campagne" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Registro Invii Newsletter & Broadcast
                </h3>
                <p className="text-xs text-slate-500">
                  Elenco storico delle comunicazioni inviate ai clienti e partner con tracciamento dello sponsor.
                </p>
              </div>
              <button
                onClick={() => setModalNewsletterOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nuova Comunicazione</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {campagne.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Nessuna campagna newsletter ancora inviata.
                </div>
              ) : (
                campagne.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {camp.titolo}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {camp.stato}
                        </span>
                        {camp.sponsorCorrelato && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
                            Sponsor: {camp.sponsorCorrelato}
                          </span>
                        )}
                      </div>

                      {camp.oggettoEmail && (
                        <div className="text-xs text-slate-600 font-medium">
                          Oggetto: &ldquo;{camp.oggettoEmail}&rdquo;
                        </div>
                      )}

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {camp.messaggio}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-xs font-semibold text-slate-900">
                        {camp.numeroDestinatari} destinatari raggiunti
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {camp.dataInviato
                          ? new Date(camp.dataInviato).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Bozza"}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Canale: {camp.canale} • Filtro: {camp.destinatariFiltro}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE AGGIUNGI / MODIFICA CLIENTE */}
      {modalClienteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>
                  {editingCliente ? "Modifica Contatto" : "Nuovo Contatto / Lead"}
                </span>
              </h3>
              <button
                onClick={() => setModalClienteOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCliente} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo o Riferimento
                </label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Es. Sofia Fontana"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="sofia@example.com"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Telefono
                  </label>
                  <input
                    type="text"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    placeholder="+39 349 000 0000"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sponsor / Canale Provenienza
                  </label>
                  <input
                    type="text"
                    value={formSponsor}
                    onChange={(e) => setFormSponsor(e.target.value)}
                    placeholder="Es. Instagram Adv, Influencer @..., Gala Arezzo"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campagna / Codice Referral
                  </label>
                  <input
                    type="text"
                    value={formCampagna}
                    onChange={(e) => setFormCampagna(e.target.value)}
                    placeholder="Es. Solitari Primavera 2026"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stato Cliente
                  </label>
                  <select
                    value={formStato}
                    onChange={(e) => setFormStato(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400 bg-white"
                  >
                    <option value="ATTIVO">Attivo</option>
                    <option value="VIP">Cliente VIP</option>
                    <option value="LEAD">Lead in Trattativa</option>
                    <option value="DISISCRITTO">Disiscritto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Codice Referral Utente
                  </label>
                  <input
                    type="text"
                    value={formReferral}
                    onChange={(e) => setFormReferral(e.target.value)}
                    placeholder="Es. vip_aurora"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Interne Atelier
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                  placeholder="Es. Interessata a solitari platino, conosciuta alla fiera..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalClienteOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submittingCliente}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingCliente ? "Salvataggio..." : "Salva Contatto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE COMPONI & INVIA NEWSLETTER */}
      {modalNewsletterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-500" />
                <span>Componi & Invia Newsletter Esclusiva</span>
              </h3>
              <button
                onClick={() => setModalNewsletterOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCampagna} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Titolo Interno Campagna
                </label>
                <input
                  type="text"
                  required
                  value={campagnaTitolo}
                  onChange={(e) => setCampagnaTitolo(e.target.value)}
                  placeholder="Es. Anteprima Nuova Collezione Diamanti Autunno"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Oggetto Email / Anteprima Notifica
                </label>
                <input
                  type="text"
                  value={campagnaOggetto}
                  onChange={(e) => setCampagnaOggetto(e.target.value)}
                  placeholder="Es. 💎 Invito Riservato: scopri le nuove creazioni in bottega"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destinatari Target
                  </label>
                  <select
                    value={campagnaFiltro}
                    onChange={(e) => setCampagnaFiltro(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400 bg-white"
                  >
                    <option value="TUTTI">Tutti gli Iscritti Attivi ({statistiche.attivi + statistiche.vip})</option>
                    <option value="SOLO_VIP">Solo Clienti VIP ({statistiche.vip})</option>
                    <option value="PER_SPONSOR">Filtra per Sponsor / Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sponsor / Brand Partner Associato
                  </label>
                  <input
                    type="text"
                    value={campagnaSponsor}
                    onChange={(e) => setCampagnaSponsor(e.target.value)}
                    placeholder="Es. Gala Arezzo 2026 o Instagram"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Messaggio della Newsletter
                </label>
                <textarea
                  required
                  rows={4}
                  value={campagnaMessaggio}
                  onChange={(e) => setCampagnaMessaggio(e.target.value)}
                  placeholder="Scrivi il messaggio d'autore per i clienti dell'Atelier..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-400 resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Tracciamento & Registro delle Sponsorizzazioni</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  L&apos;invio verrà registrato nello storico delle campagne associando lo sponsor partner e aggiornando l&apos;ultimo contatto di tutti i destinatari target.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewsletterOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submittingCampagna}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingCampagna ? "Invio in corso..." : "Invia Newsletter"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
