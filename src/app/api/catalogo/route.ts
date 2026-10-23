import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SHOWLY_CONFIG, ShowlyConfig } from "@/lib/config";

export interface ArticoloDTO {
  id: string;
  codice: string;
  titolo: string;
  categoria: string;
  specifiche: string;
  prezzo: string;
  mostraPrezzo: boolean;
  visibilita: "PUBBLICO" | "CASSAFORTE" | "NASCOSTO";
  inEvidenza: boolean;
  ordineVetrina: number;
  fotoPrincipale: string;
  fotoStillLife: string[];
  posX: number;
  posY: number;
  zoom: number;
  disponibile: boolean;
}

// Memoria condivisa di fallback per ambienti serverless read-only (es. demo Vercel)
const globalForCatalog = globalThis as unknown as {
  memoryCatalog?: ArticoloDTO[];
};

function getInitialSeedCatalog(): ArticoloDTO[] {
  return DEFAULT_SHOWLY_CONFIG.catalog.items.map((item, idx) => ({
    id: item.id,
    codice: item.code || `AUR-${101 + idx}`,
    titolo: item.title,
    categoria: item.category,
    specifiche: item.specs,
    prezzo: item.price,
    mostraPrezzo: item.showPriceOverride ?? true,
    visibilita: item.visibilita || "PUBBLICO",
    inEvidenza: Boolean(item.inEvidenza),
    ordineVetrina: idx,
    fotoPrincipale: item.imageUrl,
    fotoStillLife: item.galleryImages || [],
    posX: item.posX ?? 50,
    posY: item.posY ?? 50,
    zoom: item.zoom ?? 1,
    disponibile: true,
  }));
}

async function syncToShowcaseConfig(articoli: ArticoloDTO[]) {
  try {
    const imp = await prisma.impostazioni.findUnique({ where: { id: "singleton" } });
    let currentCfg: ShowlyConfig = DEFAULT_SHOWLY_CONFIG;
    if (imp?.showcaseConfig && imp.showcaseConfig !== "{}") {
      try {
        currentCfg = { ...DEFAULT_SHOWLY_CONFIG, ...JSON.parse(imp.showcaseConfig) };
      } catch {
        // ignore
      }
    }

    const sorted = [...articoli].sort((a, b) => a.ordineVetrina - b.ordineVetrina);
    const categoriesSet = new Set<string>(["Tutti"]);
    sorted.forEach((a) => {
      if (a.visibilita === "PUBBLICO" && a.categoria) {
        categoriesSet.add(a.categoria);
      }
    });

    const catalogItems = sorted.map((a) => ({
      id: a.id,
      code: a.codice,
      title: a.titolo,
      category: a.categoria,
      specs: a.specifiche,
      price: a.prezzo,
      imageUrl: a.fotoPrincipale,
      galleryImages: a.fotoStillLife,
      posX: a.posX,
      posY: a.posY,
      zoom: a.zoom,
      visibilita: a.visibilita,
      inEvidenza: a.inEvidenza,
      showPriceOverride: a.mostraPrezzo,
    }));

    const featuredSlides = sorted
      .filter((a) => a.visibilita === "PUBBLICO" && a.inEvidenza)
      .map((a) => ({
        id: `slide-${a.id}`,
        title: a.titolo,
        specs: a.specifiche,
        price: a.prezzo,
        showPriceOverride: a.mostraPrezzo,
        imageUrl: a.fotoPrincipale,
        posX: a.posX,
        posY: a.posY,
        zoom: a.zoom,
        ctaText: "Metti da Parte (24h) →",
      }));

    const updatedCfg: ShowlyConfig = {
      ...currentCfg,
      catalog: {
        ...currentCfg.catalog,
        categories: Array.from(categoriesSet),
        items: catalogItems,
      },
      showgallery: {
        ...currentCfg.showgallery,
        slides:
          featuredSlides.length > 0
            ? featuredSlides
            : currentCfg.showgallery.slides,
      },
    };

    await prisma.impostazioni.upsert({
      where: { id: "singleton" },
      update: { showcaseConfig: JSON.stringify(updatedCfg) },
      create: {
        id: "singleton",
        nomeAttivita: updatedCfg.brand.name,
        showcaseConfig: JSON.stringify(updatedCfg),
      },
    });
  } catch {
    // Fallback silenzioso su DB read-only
  }
}

export async function loadArticoli(): Promise<ArticoloDTO[]> {
  try {
    const rows = await prisma.prodottoCreazione.findMany({
      orderBy: { ordineVetrina: "asc" },
    });

    if (rows.length === 0) {
      const seed = getInitialSeedCatalog();
      try {
        for (const item of seed) {
          await prisma.prodottoCreazione.create({
            data: {
              id: item.id,
              codice: item.codice,
              titolo: item.titolo,
              categoria: item.categoria,
              specifiche: item.specifiche,
              prezzo: item.prezzo,
              mostraPrezzo: item.mostraPrezzo,
              visibilita: item.visibilita,
              inEvidenza: item.inEvidenza,
              ordineVetrina: item.ordineVetrina,
              fotoPrincipale: item.fotoPrincipale,
              fotoStillLife: JSON.stringify(item.fotoStillLife),
              posX: item.posX,
              posY: item.posY,
              zoom: item.zoom,
              disponibile: item.disponibile,
            },
          });
        }
      } catch {
        // Se SQLite è in sola lettura su Vercel, usa memoryCatalog
      }
      globalForCatalog.memoryCatalog = seed;
      return seed;
    }

    const mapped: ArticoloDTO[] = rows.map((r) => {
      let gallery: string[] = [];
      try {
        gallery = JSON.parse(r.fotoStillLife || "[]");
      } catch {
        gallery = [];
      }
      return {
        id: r.id,
        codice: r.codice || "AUR-001",
        titolo: r.titolo,
        categoria: r.categoria,
        specifiche: r.specifiche || "",
        prezzo: r.prezzo || "€ 0",
        mostraPrezzo: r.mostraPrezzo,
        visibilita: (r.visibilita as "PUBBLICO" | "CASSAFORTE" | "NASCOSTO") || "PUBBLICO",
        inEvidenza: r.inEvidenza,
        ordineVetrina: r.ordineVetrina,
        fotoPrincipale: r.fotoPrincipale,
        fotoStillLife: gallery,
        posX: r.posX ?? 50,
        posY: r.posY ?? 50,
        zoom: r.zoom ?? 1,
        disponibile: r.disponibile,
      };
    });

    globalForCatalog.memoryCatalog = mapped;
    return mapped;
  } catch {
    if (!globalForCatalog.memoryCatalog) {
      globalForCatalog.memoryCatalog = getInitialSeedCatalog();
    }
    return globalForCatalog.memoryCatalog;
  }
}

export async function GET() {
  const articoli = await loadArticoli();
  return NextResponse.json({ articoli });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await loadArticoli();

    const newItem: ArticoloDTO = {
      id: body.id || `art-${Date.now()}`,
      codice: body.codice || `AUR-${100 + current.length + 1}`,
      titolo: body.titolo || "Nuova Creazione",
      categoria: body.categoria || "Anelli & Fedi",
      specifiche: body.specifiche || "Manifattura Artigianale",
      prezzo: body.prezzo || "€ 450",
      mostraPrezzo: body.mostraPrezzo ?? true,
      visibilita: body.visibilita || "PUBBLICO",
      inEvidenza: Boolean(body.inEvidenza),
      ordineVetrina: body.ordineVetrina ?? current.length,
      fotoPrincipale:
        body.fotoPrincipale ||
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85",
      fotoStillLife: Array.isArray(body.fotoStillLife) ? body.fotoStillLife : [],
      posX: Number(body.posX ?? 50),
      posY: Number(body.posY ?? 50),
      zoom: Number(body.zoom ?? 1),
      disponibile: body.disponibile ?? true,
    };

    try {
      await prisma.prodottoCreazione.upsert({
        where: { id: newItem.id },
        update: {
          codice: newItem.codice,
          titolo: newItem.titolo,
          categoria: newItem.categoria,
          specifiche: newItem.specifiche,
          prezzo: newItem.prezzo,
          mostraPrezzo: newItem.mostraPrezzo,
          visibilita: newItem.visibilita,
          inEvidenza: newItem.inEvidenza,
          ordineVetrina: newItem.ordineVetrina,
          fotoPrincipale: newItem.fotoPrincipale,
          fotoStillLife: JSON.stringify(newItem.fotoStillLife),
          posX: newItem.posX,
          posY: newItem.posY,
          zoom: newItem.zoom,
          disponibile: newItem.disponibile,
        },
        create: {
          id: newItem.id,
          codice: newItem.codice,
          titolo: newItem.titolo,
          categoria: newItem.categoria,
          specifiche: newItem.specifiche,
          prezzo: newItem.prezzo,
          mostraPrezzo: newItem.mostraPrezzo,
          visibilita: newItem.visibilita,
          inEvidenza: newItem.inEvidenza,
          ordineVetrina: newItem.ordineVetrina,
          fotoPrincipale: newItem.fotoPrincipale,
          fotoStillLife: JSON.stringify(newItem.fotoStillLife),
          posX: newItem.posX,
          posY: newItem.posY,
          zoom: newItem.zoom,
          disponibile: newItem.disponibile,
        },
      });
    } catch {
      // Fallback in-memory
    }

    const existingIdx = current.findIndex((x) => x.id === newItem.id);
    const updatedList =
      existingIdx >= 0
        ? current.map((x, i) => (i === existingIdx ? newItem : x))
        : [...current, newItem];

    globalForCatalog.memoryCatalog = updatedList;
    await syncToShowcaseConfig(updatedList);

    return NextResponse.json({ success: true, articolo: newItem, articoli: updatedList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body.articoli)) {
      const list: ArticoloDTO[] = body.articoli.map((item: ArticoloDTO, idx: number) => ({
        ...item,
        ordineVetrina: idx,
      }));

      try {
        for (const item of list) {
          await prisma.prodottoCreazione.update({
            where: { id: item.id },
            data: {
              codice: item.codice,
              titolo: item.titolo,
              categoria: item.categoria,
              specifiche: item.specifiche,
              prezzo: item.prezzo,
              mostraPrezzo: item.mostraPrezzo,
              visibilita: item.visibilita,
              inEvidenza: item.inEvidenza,
              ordineVetrina: item.ordineVetrina,
              fotoPrincipale: item.fotoPrincipale,
              fotoStillLife: JSON.stringify(item.fotoStillLife || []),
              posX: item.posX ?? 50,
              posY: item.posY ?? 50,
              zoom: item.zoom ?? 1,
              disponibile: item.disponibile ?? true,
            },
          });
        }
      } catch {
        // Fallback in-memory
      }

      globalForCatalog.memoryCatalog = list;
      await syncToShowcaseConfig(list);
      return NextResponse.json({ success: true, articoli: list });
    }

    return NextResponse.json({ error: "Formato non valido" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    try {
      await prisma.prodottoCreazione.delete({ where: { id } });
    } catch {
      // Fallback in-memory
    }

    const current = await loadArticoli();
    const filtered = current.filter((x) => x.id !== id);
    globalForCatalog.memoryCatalog = filtered;
    await syncToShowcaseConfig(filtered);

    return NextResponse.json({ success: true, articoli: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
