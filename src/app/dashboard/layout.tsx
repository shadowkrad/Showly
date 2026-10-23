"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sliders,
  Settings,
  Shield,
  ExternalLink,
  ChevronRight,
  LogOut,
  Gem,
  Clock,
  Sparkles,
} from "lucide-react";
import UserSecurityModal from "@/components/UserSecurityModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [brandName, setBrandName] = useState("Atelier Aurora");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.brand?.name) setBrandName(d.brand.name);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const baseNavLinks = [
    {
      href: "/dashboard",
      label: "Camerino 24h & KPI",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/studio",
      label: "Live Showcase Studio",
      icon: Sliders,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
            <Gem className="w-4 h-4" />
          </div>
          <span className="font-black tracking-tight text-white text-base">
            taaaac<span className="text-amber-400">.eu</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Showly
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer"
          aria-label="Menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Drawer Overlay Mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* SIDEBAR UNIFICATA TAAAAC */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col h-[100dvh] max-h-[100dvh] transition-transform duration-200 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Brand Header */}
          <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                <Gem className="w-4 h-4" />
              </div>
              <span className="font-black tracking-tight text-white text-base">
                taaaac<span className="text-amber-400">.eu</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Showly
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Atelier Card */}
          <div className="px-3 py-2.5 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs">
              💎
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{brandName}</p>
              <p className="text-[10px] text-amber-400 font-mono truncate">
                Bottega d&apos;Autore &amp; Showroom
              </p>
            </div>
          </div>

          {/* Navigazione Principale */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
              Gestione Showroom
            </p>
            {baseNavLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Sezione Configurazione Standard Taaaac */}
            <div className="pt-4 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                Configurazione
              </p>
              <Link
                href="/dashboard/impostazioni"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive("/dashboard/impostazioni")
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Impostazioni &amp; Canali</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSecurityModalOpen(true);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer mt-1"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Sicurezza &amp; 2FA</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  1.0.6
                </span>
              </button>
            </div>
          </nav>

          {/* Bottom Bar: Link Vetrina & Logout */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white text-xs transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                Vedi Vetrina Pubblica
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Esci dal Gestionale</span>
            </button>

            <div className="flex items-center justify-between px-1 text-[10px] text-slate-400/70 font-mono pt-1">
              <span>Showly · Taaaac</span>
              <span className="bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded text-[9px] font-mono">
                v1.1.0
              </span>
            </div>
          </div>
        </aside>

        {/* CONTENUTO PRINCIPALE */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Modale Sicurezza v1.0.6 con React Portal */}
      <UserSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        userEmail="admin@atelieraurora.it"
      />
    </div>
  );
}
