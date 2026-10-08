"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  Palette,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Code2,
} from "lucide-react";

interface ColorPreset {
  name: string;
  colors: string[];
}

const PRESET_PALETTES: ColorPreset[] = [
  {
    name: "Crest Dark Luxury",
    colors: ["#080b11", "#0ea5e9", "#f97316", "#161f32", "#f8fafc"],
  },
  {
    name: "Roblox Classic UI",
    colors: ["#232527", "#393b3d", "#00a2ff", "#00e575", "#ffffff"],
  },
  {
    name: "Cyberpunk Neon",
    colors: ["#0d0221", "#020826", "#f706cf", "#00f5d4", "#f9f871"],
  },
  {
    name: "Sunset Vibes",
    colors: ["#2d00f7", "#6b00f7", "#a100f7", "#f700a1", "#ff7b00"],
  },
  {
    name: "Soft Pastel UI",
    colors: ["#ffb5a7", "#fcd5ce", "#f8edeb", "#f8ad9d", "#f4978e"],
  },
];

// Helper Konversi HEX ke RGB
function hexToRgb(hex: string) {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export default function ColorPalettePage() {
  const [colors, setColors] = useState<string[]>([
    "#080b11",
    "#0ea5e9",
    "#f97316",
    "#161f32",
    "#f8fafc",
  ]);
  const [selectedColor, setSelectedColor] = useState<string>("#0ea5e9");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const rgb = hexToRgb(selectedColor);
  const robloxFromRgb = `Color3.fromRGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const robloxNew = `Color3.new(${(rgb.r / 255).toFixed(3)}, ${(rgb.g / 255).toFixed(3)}, ${(rgb.b / 255).toFixed(3)})`;
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const generateRandomPalette = () => {
    const randomHex = () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    const newPalette = [
      randomHex(),
      randomHex(),
      randomHex(),
      randomHex(),
      randomHex(),
    ];
    setColors(newPalette);
    setSelectedColor(newPalette[1]);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard Tools
        </Link>

        {/* Tool Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg">
              <Palette className="w-8 h-8 text-[#f97316]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  Color Palette & Roblox Color3
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-md">
                  ROBLOX STUDIO READY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Pick, generate, dan konversi warna langsung ke format kode Luau Roblox Studio.
              </p>
            </div>
          </div>

          <button
            onClick={generateRandomPalette}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#f97316] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Generate Random
          </button>
        </div>

        {/* Palette Interactive Display */}
        <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 backdrop-blur-md">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-4">
            Aktif Palette (Klik warna untuk memilih)
          </span>

          <div className="grid grid-cols-5 gap-2 sm:gap-4 h-32 sm:h-40 rounded-xl overflow-hidden p-2 bg-slate-900/80 border border-slate-800">
            {colors.map((hex, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(hex)}
                style={{ backgroundColor: hex }}
                className={`relative rounded-lg h-full transition-all duration-300 flex flex-col justify-end p-2 sm:p-3 text-left group ${
                  selectedColor.toLowerCase() === hex.toLowerCase()
                    ? "ring-4 ring-white/80 scale-[1.02] shadow-2xl z-10"
                    : "hover:scale-[0.98] opacity-90 hover:opacity-100"
                }`}
              >
                <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-1 rounded bg-black/60 text-white backdrop-blur-sm inline-block w-fit">
                  {hex.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Details & Roblox Code Exporter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Custom Color Adjuster */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-4 h-4 text-[#0ea5e9]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Custom Color Picker
                </h3>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-slate-700 shadow-inner shrink-0"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="flex-1">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Pilih Warna Kustom:
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-10 bg-slate-950 rounded-lg border border-slate-700 cursor-pointer p-1"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  HEX Code Input:
                </label>
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-[#0ea5e9]"
                />
              </div>
            </div>

            {/* Presets Quick Select */}
            <div className="pt-6 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-3">
                Preset Tema Warna:
              </span>
              <div className="space-y-2">
                {PRESET_PALETTES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setColors(preset.colors);
                      setSelectedColor(preset.colors[1]);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="text-xs font-mono text-slate-300 font-medium">
                      {preset.name}
                    </span>
                    <div className="flex gap-1">
                      {preset.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Roblox Luau Output Panel */}
          <div className="lg:col-span-7 bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#f97316]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Format Kode Roblox (Luau)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Ready to paste in Roblox Studio
                </span>
              </div>

              <div className="space-y-4">
                {/* Color3.fromRGB */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-mono text-[#0ea5e9] font-bold">
                      Roblox Color3.fromRGB (Rekomendasi)
                    </span>
                    <button
                      onClick={() => handleCopy(robloxFromRgb, "fromRgb")}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px] font-mono"
                    >
                      {copiedFormat === "fromRgb" ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Salin Kode
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-xs font-mono text-white block mt-2 p-2 rounded bg-slate-900 border border-slate-800/80">
                    {robloxFromRgb}
                  </code>
                </div>

                {/* Color3.new */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-mono text-[#f97316] font-bold">
                      Roblox Color3.new (Normalized 0-1)
                    </span>
                    <button
                      onClick={() => handleCopy(robloxNew, "new")}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px] font-mono"
                    >
                      {copiedFormat === "new" ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Salin Kode
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-xs font-mono text-white block mt-2 p-2 rounded bg-slate-900 border border-slate-800/80">
                    {robloxNew}
                  </code>
                </div>

                {/* Standard RGB & HEX */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      HEX Code:
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-white">
                        {selectedColor.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedColor, "hex")}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedFormat === "hex" ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      Standard RGB:
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-white">
                        {rgbString}
                      </span>
                      <button
                        onClick={() => handleCopy(rgbString, "rgb")}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedFormat === "rgb" ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <Sparkles className="w-4 h-4 text-[#0ea5e9] shrink-0" />
              <span>
                Tip: Gunakan Color3.fromRGB untuk Script UI agar nilai RGB (0-255) sesuai dengan Properties tab Roblox Studio.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
