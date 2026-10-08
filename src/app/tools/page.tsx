"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  Search,
  Calculator,
  Palette,
  Code2,
  Box,
  Image as ImageIcon,
  Music,
  Sliders,
  ChevronRight,
  ArrowLeft,
  Bot,
  RefreshCw,
  Film,
  UserSearch,
  Sparkles,
} from "lucide-react";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  category: "Image" | "Audio" | "Scripting" | "Animation" | "Utility";
  icon: React.ElementType;
  badge?: string;
  href: string;
}

const ALL_TOOLS_DATA: ToolItem[] = [
  {
    id: "robux-tax",
    title: "Robux Tax Calculator",
    description: "Perhitungan otomatis potongan pajak 30% untuk DevProduct dan Gamepass secara akurat.",
    category: "Utility",
    icon: Calculator,
    badge: "Beta Live",
    href: "/tools/robux-calculator",
  },
  {
    id: "gui-builder-ai",
    title: "GUI Builder AI & Preview",
    description: "Generator antarmuka Roblox otomatis berbasis AI dengan ekspor ke LocalScript.",
    category: "Utility",
    icon: Bot,
    badge: "Concept",
    href: "#",
  },
  {
    id: "roblox-lookup",
    title: "Roblox User & Group Lookup",
    description: "Pencarian informasi detail akun, kepemilikan aset, dan ID grup secara instan.",
    category: "Utility",
    icon: UserSearch,
    badge: "Beta Live",
    href: "/tools/roblox-lookup",
  },
  {
    id: "color-palette",
    title: "Color Palette & Color3",
    description: "Generator skema warna estetika dengan konversi otomatis ke format Color3.fromRGB.",
    category: "Image",
    icon: Palette,
    badge: "Beta Live",
    href: "/tools/color-palette",
  },
  {
    id: "skybox-converter",
    title: "Skybox Converter 3D",
    description: "Konversi gambar panorama 360 derajat menjadi 6 sisi tekstur Skybox + WebGL POV & ZIP.",
    category: "Image",
    icon: ImageIcon,
    badge: "Beta Live",
    href: "/tools/skybox-converter",
  },
  {
    id: "image-upscaler",
    title: "AI Image Upscaler & Sharpener",
    description: "Perjelas tekstur, decal, dan gambar panorama Roblox 2x hingga 4x lebih tajam tanpa pecah.",
    category: "Image",
    icon: Sparkles,
    badge: "Beta Live",
    href: "/tools/image-upscaler",
  },
  {
    id: "sprite-sheet-maker",
    title: "Sprite Sheet Maker",
    description: "Penggabungan beberapa frame animasi menjadi satu file sprite sheet terkompresi.",
    category: "Image",
    icon: Box,
    href: "#",
  },
  {
    id: "material-generator",
    title: "Material Generator",
    description: "Pembuatan peta tekstur PBR (Normal, Roughness) untuk MaterialService.",
    category: "Image",
    icon: Sparkles,
    href: "#",
  },
  {
    id: "script-sync",
    title: "Script Sync Studio",
    description: "Jembatan sinkronisasi kode dari browser langsung ke Roblox Studio.",
    category: "Scripting",
    icon: RefreshCw,
    badge: "Planned",
    href: "#",
  },
  {
    id: "lua-cleaner",
    title: "Lua Cleaner & Formatter",
    description: "Pembersihan dan pemformatan struktur script Luau agar lebih terstruktur dan mudah dibaca.",
    category: "Scripting",
    icon: Code2,
    badge: "Beta Live",
    href: "/tools/lua-formatter",
  },
  {
    id: "roblox-audio-approved",
    title: "Roblox Music Approved",
    description: "Pemrosesan audio agar sesuai dengan standar durasi dan hak cipta Roblox.",
    category: "Audio",
    icon: Music,
    href: "#",
  },
  {
    id: "audio-alter",
    title: "Audio Alter & Pitcher",
    description: "Modifikasi pitch, kecepatan, dan volume untuk efek suara (SFX) Roblox.",
    category: "Audio",
    icon: Sliders,
    href: "#",
  },
  {
    id: "anim-maker",
    title: "Animation Maker & Smoother",
    description: "Editor keyframe sederhana dan penghalus kurva animasi Roblox.",
    category: "Animation",
    icon: Film,
    href: "#",
  },
];

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Image", "Scripting", "Audio", "Animation", "Utility"];

  const filteredTools = ALL_TOOLS_DATA.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wide text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Halaman Utama
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Katalog Tools Pengembangan
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Jelajahi seluruh ekosistem tools profesional untuk pengembangan Roblox. Dirancang untuk efisiensi tanpa memerlukan instalasi.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#161f32]/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tools berdasarkan nama atau fungsi..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#080b11] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0ea5e9] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-black shadow-md"
                    : "bg-[#080b11] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="group relative rounded-2xl p-[1px] bg-slate-800/60 hover:bg-gradient-to-r hover:from-[#0ea5e9] hover:via-[#f97316] hover:to-[#0ea5e9] transition-all duration-300 shadow-lg"
                >
                  <Link
                    href={tool.href}
                    className="flex flex-col h-full p-5 rounded-[15px] bg-[#161f32] hover:bg-[#1c2942] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-[#080b11] border border-slate-700/50 group-hover:border-[#0ea5e9]/30 group-hover:scale-105 transition-all">
                          <IconComponent className="w-5 h-5 text-[#0ea5e9] group-hover:text-white transition-colors" />
                        </div>
                        {tool.badge && (
                          <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-widest text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 rounded-md">
                            {tool.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-[15px] font-semibold text-white group-hover:text-[#0ea5e9] transition-colors flex items-center justify-between">
                        {tool.title}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#0ea5e9] group-hover:translate-x-1 transition-all" />
                      </h3>

                      <p className="text-[13px] text-slate-400 leading-relaxed mt-2 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">{tool.category}</span>
                      <span className="text-slate-400 group-hover:text-white transition-colors">
                        Buka Tool
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#161f32]/40 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400 font-mono">
              Tidak ada tools yang sesuai dengan pencarian Anda.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
