"use client";

import React, { useState } from "react";
import AddonModuleGuard from "@/components/dashboard/AddonModuleGuard";
import { TAAAAC_ADDONS } from "@/lib/taaaac-client";
import { Gift, Sparkles, Smartphone, PlusCircle, CheckCircle2, QrCode } from "lucide-react";
import FidelityCashierScanner from "@/components/dashboard/FidelityCashierScanner";

export default function ShowlyGiftCardsPage() {
  const [activeTab, setActiveTab] = useState<"scanner" | "catalogo">("scanner");

  return (
    <AddonModuleGuard
      addonId={TAAAAC_ADDONS.GIFT_CARDS}
      title="Buoni Regalo & Voucher d'Autore"
      description="Crea, vendi e riscuoti gift card esclusive spendibili nel tuo atelier, showroom o bottega, con riscatto a scalare e codice univoco anti-frode."
      icon="🎁"
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header di Lusso Showly */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Esperienze d&apos;Autore &amp; Gift Card</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Gift className="w-7 h-7 text-amber-600" />
              <span>Buoni Regalo &amp; Voucher Digitali</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Incassi anticipati garantiti, spendibilità a scalare e riscatto immediato in cassa con scansione QR.
            </p>
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("scanner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "scanner"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Cassa &amp; Riscatto Voucher</span>
            </button>
            <button
              onClick={() => setActiveTab("catalogo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "catalogo"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Idee &amp; Tipologie Buoni</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Cassa Scanner con Supporto Completo Voucher */}
        {activeTab === "scanner" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Terminale di Cassa Showly Integrato</p>
                <p className="text-amber-800/90 mt-0.5">
                  Cerca il cliente tramite numero di cellulare oppure inserisci/scansiona il codice voucher (es. <code className="font-mono bg-white/80 px-1 py-0.5 rounded text-amber-950 font-bold">VCH-XXXX-XXXX</code>). Il credito è a scalare e genera lo scontrino virtuale con saldo residuo.
                </p>
              </div>
            </div>

            <FidelityCashierScanner
              tenantName="Atelier d'Autore"
              pointsPerEuro={1}
              welcomeBonusPoints={15}
              rewards={[
                { id: "rew_1", name: "Consulenza d'Immagine Privata", pointsRequired: 60, rewardType: "FREE_ITEM" },
                { id: "rew_2", name: "Buono Sconto 25€", pointsRequired: 140, rewardType: "DISCOUNT", discountAmount: 25 },
              ]}
            />
          </div>
        )}

        {/* Tab 2: Vetrina Idee Buoni Showroom */}
        {activeTab === "catalogo" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Importo Libero
                </span>
                <h3 className="text-base font-bold text-slate-900">Buono Valore Atelier</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Importo personalizzato (es. 50€, 100€, 250€) spendibile su qualsiasi creazione o articolo dello showroom.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-semibold">
                  <span>Credito a scalare</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Esperienza Privata
                </span>
                <h3 className="text-base font-bold text-slate-900">Voucher Prova in Camerino VIP</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sessione one-to-one riservata con calice di benvenuto e consulenza su misura delle collezioni esclusive.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-semibold">
                  <span>Prenotazione inclusa</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Edizione Limitata
                </span>
                <h3 className="text-base font-bold text-slate-900">Gift Card Creazione d&apos;Autore</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Buono regalo per l&apos;acquisto di pezzi unici, opere d&apos;arte, gioielli o abiti sartoriali su misura.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-semibold">
                  <span>Codice anti-frode</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AddonModuleGuard>
  );
}
