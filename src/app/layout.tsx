import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Atelier Aurora — Bottega Orafa & Manifattura d'Autore",
  description: "Vetrina d'autore per creazioni artigianali. Esplora le collezioni still-life e riserva la tua prova gratuita in bottega.",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${plusJakarta.variable} ${cormorant.variable}`}>
      <body className="bg-luxe-black text-luxe-light selection:bg-amber-400 selection:text-black antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
