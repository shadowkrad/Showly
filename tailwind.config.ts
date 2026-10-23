import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxe: {
          black: "#0A0A0C",
          dark: "#111215",
          card: "#16181D",
          border: "rgba(255, 255, 255, 0.08)",
          sub: "#9496A1",
          light: "#F8F9FA",
          gold: "#D4AF37",
          goldLight: "#F3E5AB",
        },
        brand: {
          primary: "var(--brand-primary, #0A0A0C)",
          accent: "var(--brand-accent, #D4AF37)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
