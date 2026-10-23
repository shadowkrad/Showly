"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Sliders,
  ShieldCheck,
  Eye,
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
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    {
      label: "Metti da Parte (Desk)",
      href: "/dashboard",
      icon: Clock,
    },
    {
      label: "Live Showcase Studio",
      href: "/dashboard/studio",
      icon: Sliders,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E1015] text-luxe-light flex flex-col md:flex-row">
      
      {/* SIDEBAR TAAAAC STANDARD */}
      <aside className="w-full md:w-64 bg-luxe-card border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Modulo */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shadow-md">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white tracking-wide">Showly</h2>
                <span className="text-[10px] font-mono text-amber-400 block">v1.1.0 • Suite Taaaac</span>
              </div>
            </div>
          </div>

          {/* Navigazione */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-amber-400 text-black shadow-md font-bold"
                      : "text-luxe-sub hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Pulsante Apri Sicurezza */}
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-luxe-sub hover:text-amber-300 hover:bg-white/5 transition-all text-left"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sicurezza & 2FA</span>
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Vedi Vetrina Live ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci dal Gestionale</span>
          </button>
        </div>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>

      {/* Modale Sicurezza v1.0.6 con React Portal */}
      <UserSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        userEmail="admin@atelieraurora.it"
      />
    </div>
  );
}
