"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Camera,
  Upload,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Lock,
  Globe,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Move,
  ZoomIn,
  RotateCcw,
  Search,
  Package,
  Star,
  X,
} from "lucide-react";
import type { ArticoloDTO } from "@/app/api/catalogo/route";

export default function CatalogoDatabasePage() {
  const [articoli, setArticoli] = useState<ArticoloDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filterVisibilita, setFilterVisibilita] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Stato Editor Modale / Pannello Articolo
  const [editingItem, setEditingItem] = useState<ArticoloDTO | null>(null);
  const [previewRatio, setPreviewRatio] = useState<"1:1" | "16:11">("1:1");
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(
    null
  );

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pcInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchArticoli = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/catalogo");
      if (res.ok) {
        const data = await res.json();
        setArticoli(data.articoli || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticoli();
  }, []);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Compressione WebP client-side per foto da Smartphone o PC
  const compressImageToWebP = (
    file: File,
    maxWidth: number,
    callback: (dataUrl: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const webp = canvas.toDataURL("image/webp", 0.86);
          callback(webp);
        }
      };
      if (ev.target?.result) img.src = ev.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenNew = () => {
    setEditingItem({
      id: `art-${Date.now()}`,
      codice: `AUR-${100 + articoli.length + 1}`,
      titolo: "",
      categoria: "Anelli & Fedi",
      specifiche: "",
      prezzo: "€ 450",
      mostraPrezzo: true,
      visibilita: "PUBBLICO",
      inEvidenza: false,
      ordineVetrina: articoli.length,
      fotoPrincipale:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85",
      fotoStillLife: [],
      posX: 50,
      posY: 50,
      zoom: 1,
      disponibile: true,
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.titolo.trim()) {
      alert("Inserisci il titolo dell'articolo.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/catalogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      if (res.ok) {
        const data = await res.json();
        setArticoli(data.articoli || []);
        setEditingItem(null);
        showToast("Articolo salvato e sincronizzato con la vetrina!");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Eliminare definitivamente questo articolo dal database?")) return;
    const res = await fetch(`/api/catalogo?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      setArticoli(data.articoli || []);
      showToast("Articolo rimosso dal database.");
    }
  };

  const handleMoveOrder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= articoli.length) return;
    const next = [...articoli];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    const reindexed = next.map((item, idx) => ({ ...item, ordineVetrina: idx }));
    setArticoli(reindexed);

    await fetch("/api/catalogo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articoli: reindexed }),
    });
    showToast("Ordine di esposizione aggiornato!");
  };

  // Drag interattivo nel Mini-Editor per spostare il punto focale (posX, posY)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!editingItem) return;
    setIsDraggingImg(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: editingItem.posX ?? 50,
      posY: editingItem.posY ?? 50,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingImg || !dragStartRef.current || !editingItem) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posX - dx * 0.35)));
    const newY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posY - dy * 0.35)));
    setEditingItem({
      ...editingItem,
      posX: newX,
      posY: newY,
    });
  };

  const handlePointerUp = () => {
    setIsDraggingImg(false);
    dragStartRef.current = null;
  };

  // Gestione riordino foto secondarie nel Mini-Editor
  const moveGalleryPhoto = (idx: number, dir: -1 | 1) => {
    if (!editingItem) return;
    const arr = [...(editingItem.fotoStillLife || [])];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const tmp = arr[idx];
    arr[idx] = arr[target];
    arr[target] = tmp;
    setEditingItem({ ...editingItem, fotoStillLife: arr });
  };

  const promoteGalleryPhotoToMain = (idx: number) => {
    if (!editingItem) return;
    const arr = [...(editingItem.fotoStillLife || [])];
    const chosen = arr[idx];
    arr[idx] = editingItem.fotoPrincipale;
    setEditingItem({
      ...editingItem,
      fotoPrincipale: chosen,
      fotoStillLife: arr,
    });
  };

  const removeGalleryPhoto = (idx: number) => {
    if (!editingItem) return;
    const arr = (editingItem.fotoStillLife || []).filter((_, i) => i !== idx);
    setEditingItem({ ...editingItem, fotoStillLife: arr });
  };

  const filteredArticoli = articoli.filter((a) => {
    if (filterVisibilita === "PUBBLICO" && a.visibilita !== "PUBBLICO") return false;
    if (filterVisibilita === "CASSAFORTE" && a.visibilita !== "CASSAFORTE") return false;
    if (filterVisibilita === "EVIDENZA" && !a.inEvidenza) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        a.titolo.toLowerCase().includes(q) ||
        a.codice.toLowerCase().includes(q) ||
        a.categoria.toLowerCase().includes(q) ||
        a.specifiche.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Pagina */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5 text-amber-600" />
            Database Articoli &amp; Foto Still-Life
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Archivio Creazioni &amp; Mini-Editor Immagini
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Carica gli articoli scattando direttamente dallo smartphone o dal PC, centra l&apos;inquadratura col Mini-Editor e scegli se mostrarli in Vetrina o solo in Cassaforte Privata.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Articolo (Smartphone / PC)</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Barra Filtri & Ricerca */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: `Tutti (${articoli.length})` },
            {
              id: "PUBBLICO",
              label: `In Vetrina Pubblica (${
                articoli.filter((x) => x.visibilita === "PUBBLICO").length
              })`,
            },
            {
              id: "CASSAFORTE",
              label: `🔒 Solo Cassaforte (${
                articoli.filter((x) => x.visibilita === "CASSAFORTE").length
              })`,
            },
            {
              id: "EVIDENZA",
              label: `✨ ShowGallery (${articoli.filter((x) => x.inEvidenza).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterVisibilita(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterVisibilita === tab.id
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per codice, titolo o materiale..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Griglia Articoli nel Database */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500">
          Caricamento archivio articoli in corso...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredArticoli.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Anteprima con Posizione e Zoom applicati dal Mini-Editor */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                <img
                  src={item.fotoPrincipale}
                  alt={item.titolo}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    objectPosition: `${item.posX ?? 50}% ${item.posY ?? 50}%`,
                    transform: `scale(${item.zoom ?? 1})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

                {/* Badge Codice + Visibilità */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold border border-white/15">
                    {item.codice}
                  </span>
                  {item.visibilita === "CASSAFORTE" ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Lock className="w-3 h-3" />
                      Cassaforte VIP
                    </span>
                  ) : item.visibilita === "NASCOSTO" ? (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold uppercase flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Archiviato
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Vetrina
                    </span>
                  )}
                  {item.inEvidenza && (
                    <span className="px-2 py-1 rounded-lg bg-white/90 text-slate-950 text-[10px] font-extrabold uppercase flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      ShowGallery
                    </span>
                  )}
                </div>

                {/* Frecce Riordino Posizione */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, -1)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-black/65 hover:bg-black text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    title="Sposta prima in vetrina"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 1)}
                    disabled={idx === filteredArticoli.length - 1}
                    className="w-7 h-7 rounded-lg bg-black/65 hover:bg-black text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    title="Sposta dopo in vetrina"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Prezzo & Categoria in Basso */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    {item.categoria}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/70 border border-white/15 text-white text-xs font-bold">
                    {item.mostraPrezzo ? item.prezzo : "Su Richiesta"}
                  </span>
                </div>
              </div>

              {/* Corpo Card */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.titolo}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.specifiche}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>
                      Inquadratura: X:{item.posX}% Y:{item.posY}% • Zoom:{item.zoom}x
                    </span>
                    {item.fotoStillLife?.length > 0 && (
                      <span className="text-amber-700 font-semibold">
                        +{item.fotoStillLife.length} foto
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...item })}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modifica &amp; Posizione Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Elimina articolo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE / PANNELLO MINI-EDITOR IMMAGINE & SCHEDA ARTICOLO */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full p-5 sm:p-8 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">
                  Scheda Articolo &amp; Mini-Editor Fotografico
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {editingItem.titolo || "Nuova Creazione in Archivio"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* COLONNA SINISTRA (6 COL): CARICAMENTO SMARTPHONE/PC + MINI-EDITOR POSIZIONE IMMAGINE */}
              <div className="lg:col-span-6 space-y-4">
                {/* Pulsanti Scatto Smartphone vs Upload PC */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      1. Carica Foto da Smartphone o PC
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Auto-ottimizzazione WebP HD
                    </span>
                  </div>

                  {/* Input Nascosto Scatto Fotocamera Smartphone */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        compressImageToWebP(f, 1400, (webp) =>
                          setEditingItem({
                            ...editingItem,
                            fotoPrincipale: webp,
                            posX: 50,
                            posY: 50,
                            zoom: 1,
                          })
                        );
                      }
                    }}
                  />

                  {/* Input Nascosto Galleria / PC */}
                  <input
                    ref={pcInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        compressImageToWebP(f, 1400, (webp) =>
                          setEditingItem({
                            ...editingItem,
                            fotoPrincipale: webp,
                            posX: 50,
                            posY: 50,
                            zoom: 1,
                          })
                        );
                      }
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 Scatta da Smartphone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => pcInputRef.current?.click()}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>💻 Scegli da Galleria / PC</span>
                    </button>
                  </div>
                </div>

                {/* MINI-EDITOR VISUALE POSIZIONE & ZOOM */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Move className="w-4 h-4 text-amber-600" />
                      2. Mini-Editor Posizione &amp; Inquadratura
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewRatio("1:1")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          previewRatio === "1:1"
                            ? "bg-slate-900 text-amber-400"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        Quadrato 1:1
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewRatio("16:11")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          previewRatio === "16:11"
                            ? "bg-slate-900 text-amber-400"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        ShowGallery 16:11
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    💡 <strong>Trascina la foto col dito o col mouse</strong> per centrare il soggetto, oppure usa i cursori di precisione qui sotto:
                  </p>

                  {/* Canvas Interattivo Drag & Zoom */}
                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`relative w-full ${
                      previewRatio === "1:1" ? "aspect-square max-h-[290px]" : "aspect-[16/11]"
                    } mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-amber-400/60 cursor-grab active:cursor-grabbing select-none touch-none shadow-inner`}
                  >
                    <img
                      src={editingItem.fotoPrincipale}
                      alt="Anteprima Inquadratura"
                      draggable={false}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{
                        objectPosition: `${editingItem.posX}% ${editingItem.posY}%`,
                        transform: `scale(${editingItem.zoom})`,
                      }}
                    />
                    {/* Griglia dei Terzi di Riferimento */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-35">
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-b border-white/40" />
                      <div className="border-r border-white/40" />
                      <div className="border-r border-white/40" />
                      <div />
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 text-amber-300 font-mono text-[10px]">
                      X:{editingItem.posX}% • Y:{editingItem.posY}% • {editingItem.zoom.toFixed(2)}x
                    </div>
                  </div>

                  {/* Sliders di Precisione X, Y, Zoom */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Orizzontale (X)</span>
                        <span className="font-mono">{editingItem.posX}%</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={editingItem.posX}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, posX: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Verticale (Y)</span>
                        <span className="font-mono">{editingItem.posY}%</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={editingItem.posY}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, posY: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Zoom
                        </span>
                        <span className="font-mono">{editingItem.zoom.toFixed(2)}x</span>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={2}
                        step={0.05}
                        value={editingItem.zoom}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, zoom: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({ ...editingItem, posX: 50, posY: 50, zoom: 1 })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Ripristina Centro (50% / 50% / 1x)</span>
                    </button>
                  </div>
                </div>

                {/* Galleria Foto Secondarie (Riordino Posizione Immagini) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      3. Galleria Dettagli &amp; Ordine Immagini ({editingItem.fotoStillLife?.length || 0})
                    </span>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((f) => {
                          compressImageToWebP(f, 1200, (webp) => {
                            setEditingItem((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    fotoStillLife: [...(prev.fotoStillLife || []), webp],
                                  }
                                : null
                            );
                          });
                        });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold cursor-pointer"
                    >
                      + Aggiungi Foto Dettaglio
                    </button>
                  </div>

                  {editingItem.fotoStillLife && editingItem.fotoStillLife.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {editingItem.fotoStillLife.map((imgUrl, gIdx) => (
                        <div
                          key={gIdx}
                          className="relative group rounded-xl overflow-hidden border border-slate-300 aspect-square bg-slate-900"
                        >
                          <img
                            src={imgUrl}
                            alt={`Dettaglio ${gIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveGalleryPhoto(gIdx, -1)}
                                className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                                title="Sposta a sinistra"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveGalleryPhoto(gIdx, 1)}
                                className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                                title="Sposta a destra"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeGalleryPhoto(gIdx)}
                                className="p-1 rounded bg-rose-500 text-white"
                                title="Rimuovi"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => promoteGalleryPhotoToMain(gIdx)}
                              className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-bold"
                            >
                              Usa come Principale
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Nessuna foto secondaria aggiunta. Puoi caricare altre angolazioni o indossato.
                    </p>
                  )}
                </div>
              </div>

              {/* COLONNA DESTRA (6 COL): DATI ARTICOLO & VISIBILITÀ CASSAFORTE / VETRINA */}
              <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Codice Articolo
                      </label>
                      <input
                        type="text"
                        value={editingItem.codice}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, codice: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                        placeholder="es. AUR-108"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Categoria Collezione
                      </label>
                      <input
                        type="text"
                        value={editingItem.categoria}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, categoria: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                        placeholder="es. Anelli & Fedi, Collane, Alta Gioielleria..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Titolo Creazione / Articolo *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.titolo}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, titolo: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                      placeholder="es. Solitario Luce Eterna in Platino"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specifiche Tecniche / Materiali / Taglie
                    </label>
                    <textarea
                      rows={3}
                      value={editingItem.specifiche}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, specifiche: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                      placeholder="es. Oro Bianco 750‰ (18kt) • Diamante Naturale 0.65ct F-VS1 Certificato GIA"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Prezzo di Listino
                      </label>
                      <input
                        type="text"
                        value={editingItem.prezzo}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, prezzo: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                        placeholder="es. € 1.450"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.mostraPrezzo}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              mostraPrezzo: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span>Mostra Prezzo al Cliente</span>
                      </label>
                    </div>
                  </div>

                  {/* Scelta Destinazione: Vetrina Pubblica vs Cassaforte Privata */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      Destinazione &amp; Riservatezza Articolo
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem({ ...editingItem, visibilita: "PUBBLICO" })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          editingItem.visibilita === "PUBBLICO"
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Vetrina Pubblica</span>
                        </div>
                        <p className="text-[10px] opacity-75 mt-1">
                          Visibile a tutti i visitatori del sito.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem({
                            ...editingItem,
                            visibilita: "CASSAFORTE",
                            inEvidenza: false,
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          editingItem.visibilita === "CASSAFORTE"
                            ? "bg-slate-900 text-amber-300 border-amber-500 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Solo Cassaforte</span>
                        </div>
                        <p className="text-[10px] opacity-75 mt-1">
                          Invisibile sul sito: visibile solo col link privato.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem({
                            ...editingItem,
                            visibilita: "NASCOSTO",
                            inEvidenza: false,
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          editingItem.visibilita === "NASCOSTO"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Bozza / Nascosto</span>
                        </div>
                        <p className="text-[10px] opacity-75 mt-1">
                          Conservato in archivio interno.
                        </p>
                      </button>
                    </div>

                    {editingItem.visibilita === "PUBBLICO" && (
                      <label className="flex items-center gap-2.5 pt-2 border-t border-amber-200/80 text-xs font-bold text-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.inEvidenza}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              inEvidenza: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>
                          Metti in evidenza anche nello slider panoramico &ldquo;ShowGallery&rdquo;
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Pulsanti Salva / Annulla */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Salvataggio..." : "💾 Salva Articolo & Inquadratura"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
