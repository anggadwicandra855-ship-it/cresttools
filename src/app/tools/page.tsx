"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, ArrowLeft } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES } from "@/lib/tools";

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const query = searchQuery.trim().toLowerCase();

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wide text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Halaman Utama
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Katalog Tools Pengembangan</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Jelajahi seluruh ekosistem tools profesional untuk pengembangan Roblox. Dirancang untuk efisiensi tanpa
            memerlukan instalasi.
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
              aria-label="Cari tools"
              className="w-full pl-10 pr-4 py-2.5 bg-[#080b11] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0ea5e9] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {TOOL_CATEGORIES.map((cat) => (
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
              const isLive = tool.status === "live";

              const cardBody = (
                <>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-2.5 rounded-xl bg-[#080b11] border border-slate-700/50 transition-all ${
                          isLive ? "group-hover:border-[#0ea5e9]/30 group-hover:scale-105" : ""
                        }`}
                      >
                        <IconComponent
                          className={`w-5 h-5 transition-colors ${
                            isLive ? "text-[#0ea5e9] group-hover:text-white" : "text-slate-500"
                          }`}
                        />
                      </div>
                      {!isLive && (
                        <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-widest text-slate-400 bg-slate-800/60 border border-slate-700/60 rounded-md">
                          SEGERA
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-[15px] font-semibold transition-colors flex items-center justify-between ${
                        isLive ? "text-white group-hover:text-[#0ea5e9]" : "text-slate-300"
                      }`}
                    >
                      {tool.title}
                      {isLive && (
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#0ea5e9] group-hover:translate-x-1 transition-all" />
                      )}
                    </h3>

                    <p className="text-[13px] text-slate-400 leading-relaxed mt-2 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">{tool.category}</span>
                    <span className={isLive ? "text-slate-400 group-hover:text-white transition-colors" : "text-slate-600"}>
                      {isLive ? "Buka Tool" : "Dalam pengembangan"}
                    </span>
                  </div>
                </>
              );

              return isLive ? (
                <div
                  key={tool.id}
                  className="group relative rounded-2xl p-[1px] bg-slate-800/60 hover:bg-gradient-to-r hover:from-[#0ea5e9] hover:via-[#f97316] hover:to-[#0ea5e9] transition-all duration-300 shadow-lg"
                >
                  <Link
                    href={tool.href}
                    className="flex flex-col h-full p-5 rounded-[15px] bg-[#161f32] hover:bg-[#1c2942] transition-colors"
                  >
                    {cardBody}
                  </Link>
                </div>
              ) : (
                <div
                  key={tool.id}
                  aria-disabled="true"
                  className="relative rounded-2xl p-[1px] bg-slate-800/40 opacity-70 cursor-not-allowed"
                >
                  <div className="flex flex-col h-full p-5 rounded-[15px] bg-[#161f32]/70">{cardBody}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#161f32]/40 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400 font-mono">Tidak ada tools yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
