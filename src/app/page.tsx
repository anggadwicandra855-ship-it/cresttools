import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Zap,
  ShieldCheck,
  Rocket,
  Box,
  Hourglass,
  Gift,
} from "lucide-react";
import { LIVE_TOOLS, SOON_TOOLS } from "@/lib/tools";

export default function HomePage() {
  return (
    <div className="flex-1 bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white overflow-x-clip">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative pt-16 pb-20 sm:pt-28 sm:pb-28 text-center">
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
              hingga konversi Skybox 360°. Dirancang untuk efisiensi, dengan sebagian besar proses
              berjalan langsung di browser Anda.
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
                href="/tools/skybox-converter"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#161f32] border border-slate-700 text-white font-semibold text-sm hover:bg-slate-800 transition-all"
              >
                <Box className="w-4 h-4 text-[#0ea5e9]" />
                Coba Skybox Converter
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-4 max-w-[520px] mx-auto p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-center py-3 rounded-xl bg-[#080b11]">
                <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                  <Box className="w-4 h-4 text-[#0ea5e9]" /> {LIVE_TOOLS.length}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 mt-1">TOOLS AKTIF</div>
              </div>
              <div className="text-center py-3">
                <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                  <Hourglass className="w-4 h-4 text-[#f97316]" /> {SOON_TOOLS.length}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 mt-1">SEGERA HADIR</div>
              </div>
              <div className="text-center py-3">
                <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-400" /> Gratis
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 mt-1">AKSES BETA</div>
              </div>
            </div>
          </div>
        </section>

        {/* TOOLS SIAP PAKAI */}
        <section className="pb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Tools Siap Pakai</h2>
              <p className="text-sm text-slate-400 mt-1">Langsung bisa dipakai, tanpa instalasi.</p>
            </div>
            <Link href="/tools" className="hidden sm:block text-xs font-semibold text-[#0ea5e9] hover:underline">
              Lihat Semua Tools →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LIVE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className="glow-card group">
                  <Link href={tool.href} className="relative block h-full rounded-2xl bg-[#161f32] p-[1px]">
                    <div className="h-full rounded-[15px] bg-[#161f32]/90 p-6 transition-colors group-hover:bg-[#161f32]">
                      <div className="mb-5 w-fit rounded-xl border border-slate-800 bg-slate-900 p-2.5 transition-colors group-hover:border-[#0ea5e9]/30">
                        <Icon className="h-5 w-5 text-[#0ea5e9]" />
                      </div>
                      <h3 className="font-semibold text-white">{tool.title}</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{tool.description}</p>
                      <div className="mt-5 flex items-center gap-1 text-xs font-mono text-[#0ea5e9] transition-all group-hover:gap-2">
                        Buka Tool <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* VALUE */}
        <section className="pb-24 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Performa Instan",
              desc: "Tidak memerlukan instalasi. Sebagian besar proses berjalan langsung di browser Anda.",
            },
            {
              icon: ShieldCheck,
              title: "Privasi Dijaga",
              desc: "Gambar dan kode diproses di browser. Fitur upload ke Roblox hanya meneruskan file lewat server kami ke Roblox, tanpa disimpan.",
            },
            {
              icon: Code2,
              title: "Dibuat oleh Developer",
              desc: "Setiap tools dirancang berdasarkan kebutuhan nyata pengembangan di Roblox Studio.",
            },
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
