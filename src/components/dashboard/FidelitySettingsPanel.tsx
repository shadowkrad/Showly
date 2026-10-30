"use client";

import React, { useState } from "react";
import { Award, Gift, Plus, Trash2, Sparkles, Percent, Gem, Crown } from "lucide-react";

export interface FidelityRewardItem {
  id: string;
  name: string;
  pointsRequired: number;
  rewardType: "DISCOUNT" | "FREE_ITEM";
  discountAmount?: number;
  freeItemName?: string;
}

export interface FidelitySettingsData {
  enabled: boolean;
  pointsPerEuro: number;
  welcomeBonusPoints: number;
  minPointsToRedeem: number;
  rewards: FidelityRewardItem[];
}

const PRESET_ATELIER: FidelitySettingsData = {
  enabled: true,
  pointsPerEuro: 1,
  welcomeBonusPoints: 15,
  minPointsToRedeem: 60,
  rewards: [
    { id: "rew_s1", name: "Consulenza d'Immagine & Prova Privata Atelier", pointsRequired: 60, rewardType: "FREE_ITEM", freeItemName: "Sessione privata one-to-one in showroom con calice di benvenuto" },
    { id: "rew_s2", name: "Sconto 25€ su Creazione d'Autore", pointsRequired: 140, rewardType: "DISCOUNT", discountAmount: 25 },
    { id: "rew_s3", name: "Invito Esclusivo VIP Preview Nuova Collezione", pointsRequired: 250, rewardType: "FREE_ITEM", freeItemName: "Pass VIP con posto riservato alla sfilata/preview privata" },
  ],
};

const PRESET_GALLERIA: FidelitySettingsData = {
  enabled: true,
  pointsPerEuro: 1,
  welcomeBonusPoints: 20,
  minPointsToRedeem: 50,
  rewards: [
    { id: "rew_g1", name: "Catalogo Rilegato a Tiratura Limitata in Omaggio", pointsRequired: 50, rewardType: "FREE_ITEM", freeItemName: "Volume fotografico d'arte da collezione" },
    { id: "rew_g2", name: "Sconto 50€ su Opera d'Arte o Scultura", pointsRequired: 200, rewardType: "DISCOUNT", discountAmount: 50 },
    { id: "rew_g3", name: "Aperitivo con l'Artista & Incontro Riservato", pointsRequired: 300, rewardType: "FREE_ITEM", freeItemName: "Esperienza esclusiva meet-the-artist in galleria" },
  ],
};

export default function FidelitySettingsPanel({ data, onChange }: { data: FidelitySettingsData; onChange: (upd: FidelitySettingsData) => void }) {
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState(60);
  const [newRewardType, setNewRewardType] = useState<"DISCOUNT" | "FREE_ITEM">("FREE_ITEM");
  const [newRewardValue, setNewRewardValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddReward = () => {
    if (!newRewardName.trim()) return;

    const newItem: FidelityRewardItem = {
      id: "rew_" + Date.now(),
      name: newRewardName.trim(),
      pointsRequired: Math.max(1, Number(newRewardPoints) || 10),
      rewardType: newRewardType,
      discountAmount: newRewardType === "DISCOUNT" ? Number(newRewardValue) || 10 : undefined,
      freeItemName: newRewardType === "FREE_ITEM" ? (newRewardValue.trim() || newRewardName.trim()) : undefined,
    };

    onChange({
      ...data,
      rewards: [...(data.rewards || []), newItem],
    });

    setNewRewardName("");
    setNewRewardPoints(60);
    setNewRewardValue("");
    setShowAddForm(false);
  };

  const handleRemoveReward = (id: string) => {
    onChange({
      ...data,
      rewards: (data.rewards || []).filter((r) => r.id !== id),
    });
  };

  const applyPreset = (preset: FidelitySettingsData) => {
    onChange({
      ...preset,
      enabled: data.enabled !== undefined ? data.enabled : true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Toggle */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Taaaac Fidelity & Club Clienti Atelier</h3>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  Novità v1.1.0
                </span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Fidelizza collezionisti e acquirenti delle tue creazioni d&apos;autore. I clienti ricevono anteprime esclusive e saldo punti direttamente su Telegram o WhatsApp.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={data.enabled || false}
              onChange={(e) => onChange({ ...data, enabled: e.target.checked })}
            />
            <div className="w-14 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {data.enabled && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              Il club fedeltà è attivo. Il numero di telefono del cliente è la sua chiave d&apos;accesso esclusiva!
            </span>
          </div>
        )}
      </div>

      {data.enabled && (
        <>
          {/* Preset Showly */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h4 className="font-semibold text-neutral-900 dark:text-white">Preset Consigliati per Atelier & Showroom</h4>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
              Configura il programma fedeltà con un solo click scegliendo un modello per botteghe d&apos;autore e gallerie:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => applyPreset(PRESET_ATELIER)}
                className="flex items-start gap-3 p-3 text-left rounded-xl bg-white dark:bg-neutral-900 border border-amber-200/80 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-sm"
              >
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg shrink-0">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm text-neutral-900 dark:text-white">Atelier di Moda & Creazioni</div>
                  <div className="text-xs text-neutral-500 mt-0.5">1 punto ogni 1 € • Consulenza privata a 60 pt • Sconto 25€ a 140 pt • Pass VIP</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(PRESET_GALLERIA)}
                className="flex items-start gap-3 p-3 text-left rounded-xl bg-white dark:bg-neutral-900 border border-yellow-200/80 dark:border-neutral-800 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all shadow-sm"
              >
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-lg shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm text-neutral-900 dark:text-white">Galleria d&apos;Arte & Sculture</div>
                  <div className="text-xs text-neutral-500 mt-0.5">1 punto ogni 1 € • Volume catalogo a 50 pt • Sconto 50€ a 200 pt • Meet the artist</div>
                </div>
              </button>
            </div>
          </div>

          {/* Regole di Assegnazione Punti */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-neutral-500" />
              Regole di Assegnazione & Accumulo Punti
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Punti per ogni Euro speso (€)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={data.pointsPerEuro || 1}
                  onChange={(e) => onChange({ ...data, pointsPerEuro: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Es. 1 = 1 punto ogni 1 € speso</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Punti Bonus di Benvenuto
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={data.welcomeBonusPoints || 15}
                  onChange={(e) => onChange({ ...data, welcomeBonusPoints: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Accreditati alla prima prenotazione o visita</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Soglia Minima per Riscatto
                </label>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={data.minPointsToRedeem || 60}
                  onChange={(e) => onChange({ ...data, minPointsToRedeem: parseInt(e.target.value, 10) || 60 })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Punti minimi per richiedere vantaggi</p>
              </div>
            </div>
          </div>

          {/* Catalogo Premi */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  Catalogo Esperienze & Vantaggi Esclusivi
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Definisci le esperienze e i premi che i clienti possono riscattare con i punti accumulati
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi Premio
              </button>
            </div>

            {/* Form Aggiunta Premio */}
            {showAddForm && (
              <div className="p-4 mb-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
                <div className="font-medium text-xs text-neutral-700 dark:text-neutral-300">Nuovo Premio da Catalogo</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-neutral-500 mb-1">Nome Esperienza / Vantaggio</label>
                    <input
                      type="text"
                      placeholder="es. Consulenza Privata o Sconto 25€"
                      value={newRewardName}
                      onChange={(e) => setNewRewardName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Punti Richiesti</label>
                    <input
                      type="number"
                      min="1"
                      value={newRewardPoints}
                      onChange={(e) => setNewRewardPoints(parseInt(e.target.value, 10) || 10)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Tipologia</label>
                    <select
                      value={newRewardType}
                      onChange={(e) => setNewRewardType(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                    >
                      <option value="FREE_ITEM">Esperienza / Servizio Omaggio</option>
                      <option value="DISCOUNT">Sconto su Acquisto (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">
                    {newRewardType === "DISCOUNT" ? "Valore dello Sconto (€)" : "Dettaglio Esperienza Omaggio"}
                  </label>
                  <input
                    type="text"
                    placeholder={newRewardType === "DISCOUNT" ? "es. 25 (per 25€ di sconto)" : "es. Degustazione con calice di benvenuto e consulente d'immagine dedicato"}
                    value={newRewardValue}
                    onChange={(e) => setNewRewardValue(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={handleAddReward}
                    className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                  >
                    Salva Premio
                  </button>
                </div>
              </div>
            )}

            {/* Elenco Premi */}
            {(!data.rewards || data.rewards.length === 0) ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                Nessun premio configurato. Clicca &quot;Aggiungi Premio&quot; o applica un preset sopra.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.rewards.map((reward) => (
                  <div key={reward.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                          {reward.name}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {reward.rewardType === "DISCOUNT" ? `Sconto €${reward.discountAmount}` : "Omaggio"}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          {reward.rewardType === "FREE_ITEM" && reward.freeItemName ? reward.freeItemName : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full">
                        {reward.pointsRequired} pt
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveReward(reward.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Elimina premio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
