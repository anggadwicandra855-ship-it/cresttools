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
        background: "#080b11",
        surface: "#0f172a",
        "surface-card": "#161f32",
        "crest-blue": "#0ea5e9",      // Sky Blue
        "crest-blue-glow": "#38bdf8",
        "crest-orange": "#f97316",    // Sunset Orange
        "crest-orange-glow": "#fb923c",
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(ellipse at top, rgba(14, 165, 233, 0.15), rgba(249, 115, 22, 0.08), transparent 70%)",
        "card-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        "glass-sm": "0 4px 30px rgba(0, 0, 0, 0.1)",
        "crest-glow": "0 0 25px rgba(14, 165, 233, 0.25)",
        "orange-glow": "0 0 25px rgba(249, 115, 22, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
