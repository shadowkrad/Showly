"use client";

import { useState } from "react";
import { X, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { ShowlyConfig } from "@/lib/config";

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShowlyConfig;
  preselectedTitle?: string;
}

export default function ReserveModal({
  isOpen,
  onClose,
  config,
  preselectedTitle = "Creazione in Vetrina",
}: ReserveModalProps) {
  const [nomeCliente, setNomeCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCliente || !whatsapp) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCliente,
          whatsapp,
          titoloPezzo: preselectedTitle,
          note,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Si è verificato un errore durante la prenotazione. Riprova.");
      }
    } catch {
      alert("Errore di connessione. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = config.reserveModal.whatsappTemplateMessage.replace(
      "{titoloPezzo}",
      preselectedTitle
    );
    const cleanPhone =
      config.atelier.whatsappButtonText.replace(/[^0-9]/g, "") || "393400000000";
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-luxe-card border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Pulsante Chiusura */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-luxe-sub hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <div>
            {/* Header del Modale */}
            <div className="mb-6">
              <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase font-mono block mb-1">
                {config.reserveModal.tagLabel}
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mb-2">
                {config.reserveModal.title}
              </h3>
              <p className="text-xs text-luxe-sub leading-relaxed">
                {config.reserveModal.description}
              </p>
            </div>

            {/* Pezzo Selezionato in Evidenza */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                  Pezzo da Riservare:
                </span>
                <span className="text-sm font-semibold text-white">
                  {preselectedTitle}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>Blocco 24h</span>
              </div>
            </div>

            {/* Form di Richiesta */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-luxe-light uppercase tracking-wider block mb-1.5">
                  Il Tuo Nome e Cognome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Laura Rossi"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-luxe-sub/50 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-luxe-light uppercase tracking-wider block mb-1.5">
                  Cellulare / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="es. +39 340 1234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-luxe-sub/50 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-luxe-light uppercase tracking-wider block mb-1.5">
                  Note o Giorno Preferito di Visita (Opzionale)
                </label>
                <textarea
                  rows={2}
                  placeholder="es. Vorrei provarlo sabato mattina attorno alle 11:00..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-luxe-sub/50 text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Salvataggio..." : config.reserveModal.submitButtonLabel}
              </button>
            </form>
          </div>
        ) : (
          /* Schermata di Successo & Inoltro WhatsApp */
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif-luxury text-3xl font-bold text-white mb-2">
                Richiesta Confermata!
              </h3>
              <p className="text-xs text-luxe-sub leading-relaxed max-w-sm mx-auto">
                {config.reserveModal.successAlertMessage}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={handleOpenWhatsApp}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <span>💬 Apri Chat WhatsApp con la Bottega</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
              >
                Chiudi Finestra
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
