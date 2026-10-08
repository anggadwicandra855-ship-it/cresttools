"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  ArrowRight,
  Code2,
  Palette,
  Calculator,
  Zap,
  ShieldCheck,
  Rocket,
  Box,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white overflow-x-hidden">
      <Navbar />

      <style>{`
       .glow-card { position: relative; }
       .glow-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          background: linear-gradient(120deg, #0ea5e9, #f97316, #0ea5e9);
          border-radius: 16px;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: -1;
          filter: blur(0px);
        }
       .glow-card:hover::before {
          opacity: 0.8;
          filter: blur(8px);
        }
       .glow-card-inner {
          position: relative;
          border-radius: 16px;
          background: #161f32;
          height: 100%;
        }
      `}</style>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative pt-24 pb-20 sm:pt-36 sm:pb-28 text-center">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-r from-[#0ea5e9]/15 to-[#f97316]/15 blur-[130px] rounded-full pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161f32] border border-slate-800 text-[11px] font-mono tracking-widest text-slate-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CREST TEAM — ROBLOX DEVELOPER ECOSYSTEM
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-black tracking-[-0.03em] leading-[0.9]">
              <span className="text-white">Platform Tools</span>
              <br />
              <span className="bg-gradient-to-r from-[#0ea5e9] to-[#f97316] bg-clip-text text-transparent">
                Profesional
              </span>
              <br />
              <span className="text-white">Untuk Developer Roblox</span>
            </h1>

            <p className="mt-6 text-[15px] sm:text-[17px] text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
              Solusi terintegrasi untuk perhitungan Robux, formatting script Luau, konversi Color3,
              hingga pembangunan antarmuka. Dirancang untuk efisiensi, berjalan sepenuhnya di browser.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tools"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                <Rocket className="w-4 h-4" />
                Jelajahi Katalog Tools
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools/lua-formatter"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#161f32] border border-slate-700 text-white font-semibold text-sm hover:bg-slate-800 transition-all"
              >
                <Code2 className="w-4 h-4 text-[#0ea5e9]" />
                Coba Lua Formatter
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-4 max-w-[520px] mx-auto p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-center py-3 rounded-xl bg-[#080b11]">
                <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                  <Box className="w-4 h-4 text-[#0ea5e9]" /> 12+
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 mt-1">TOOLS TERSEDIA</div>
              </div>
              <div className="text-center py-3">
                <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-[#f97316]" /> 1.2K+
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 mt-1">PENGGUNA AKTIF</div>
              </div>
              <div className="text-center py-3">
                <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" /> 100%
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 mt-1">GRATIS AKSES</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="pb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Tools Unggulan</h2>
              <p className="text-sm text-slate-400 mt-1">Paling sering digunakan oleh developer dalam minggu ini.</p>
            </div>
            <Link href="/tools" className="hidden sm:block text-xs font-semibold text-[#0ea5e9] hover:underline">
              Lihat Semua Tools →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px]">
            {[
              { icon: Calculator, title: "Robux Tax Calculator", desc: "Kalkulasi otomatis potongan 30% untuk DevProduct dan Gamepass secara akurat.", href: "/tools/robux-calculator" },
              { icon: Code2, title: "Lua Cleaner & Formatter", desc: "Merapi dan memformat struktur kode Luau agar lebih terstruktur dan mudah dibaca.", href: "/tools/lua-formatter" },
              { icon: Palette, title: "Color Palette & Color3", desc: "Generator skema warna dengan konversi otomatis ke format Color3.fromRGB.", href: "/tools/color-palette" },
            ].map((tool) => (
              <div key={tool.title} className="glow-card group">
                <Link href={tool.href} className="glow-card-inner block p-[1px]">
                  <div className="p-6 rounded-[15px] bg-[#161f32]/90 h-full group-hover:bg-[#161f32] transition-colors">
                    <div className="p-2.5 w-fit rounded-xl bg-slate-900 border border-slate-800 mb-5 group-hover:border-[#0ea5e9]/30 transition-colors">
                      <tool.icon className="w-5 h-5 text-[#0ea5e9]" />
                    </div>
                    <h3 className="font-semibold text-white">{tool.title}</h3>
                    <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">{tool.desc}</p>
                    <div className="mt-5 text-xs font-mono text-[#0ea5e9] flex items-center gap-1 group-hover:gap-2 transition-all">
                      Buka Tool <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* VALUE */}
        <section className="pb-24 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: "Performa Instan", desc: "Tidak memerlukan instalasi. Semua proses berjalan langsung di browser Anda." },
            { icon: ShieldCheck, title: "Keamanan Terjamin", desc: "Kode dan data Anda diproses secara lokal (client-side) dan tidak disimpan di server." },
            { icon: Code2, title: "Dibuat oleh Developer", desc: "Setiap tools dirancang berdasarkan kebutuhan nyata pengembangan di Roblox Studio." },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <item.icon className="w-5 h-5 text-slate-300 mb-4" />
              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
              <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-800/60 py-8 text-center text-[11px] font-mono tracking-widest text-slate-500">
        © 2026 CREST TEAM — PROFESSIONAL ROBLOX DEVELOPMENT TOOLS
      </footer>
    </div>
  );
}