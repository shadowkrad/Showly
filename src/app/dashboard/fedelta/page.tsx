"use client";

import React from "react";
import AddonModuleGuard from "@/components/dashboard/AddonModuleGuard";
import { TAAAAC_ADDONS } from "@/lib/taaaac-client";
import { Award, Sparkles, Smartphone, QrCode } from "lucide-react";
import FidelityCashierScanner from "@/components/dashboard/FidelityCashierScanner";

export default function ShowlyFedeltaPage() {
  return (
    <AddonModuleGuard
      addonId={TAAAAC_ADDONS.LOYALTY_CARD}
      title="Club Esclusivo & Fidelity VIP"
      description="Fidelizza i tuoi clienti più preziosi: carta fedeltà virtuale nello smartphone, accumulo punti su ogni acquisto e privilegi riservati."
      icon="🎟️"
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header di Lusso Showly */}
        <div className="border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Fidelity Card Smartphone (Apple Wallet &amp; Google Wallet)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-amber-600" />
            <span>Club Fedeltà &amp; Raccolta Punti VIP</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Assegna punti in cassa tramite cellulare o QR Code e consenti ai clienti di riscattare premi ed esperienze esclusive.
          </p>
        </div>

        {/* Terminale Cassa Fedeltà */}
        <FidelityCashierScanner
          tenantName="Atelier d'Autore"
          pointsPerEuro={1}
          welcomeBonusPoints={15}
          rewards={[
            { id: "rew_1", name: "Consulenza d'Immagine Privata", pointsRequired: 60, rewardType: "FREE_ITEM" },
            { id: "rew_2", name: "Buono Sconto 25€ su Creazioni", pointsRequired: 140, rewardType: "DISCOUNT", discountAmount: 25 },
            { id: "rew_3", name: "Invito VIP alla Nuova Collezione", pointsRequired: 250, rewardType: "FREE_ITEM" },
          ]}
        />
      </div>
    </AddonModuleGuard>
  );
}
