"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  Calculator,
  ArrowLeft,
  Copy,
  Check,
  TrendingUp,
  Percent,
  Coins,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";

// Helper Pemformat Angka Konsisten (Mencegah Hydration Mismatch)
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export default function RobuxCalculatorPage() {
  const [mode, setMode] = useState<"earn" | "target">("earn");
  const [amount, setAmount] = useState<string>("1000");
  const [copied, setCopied] = useState(false);

  const numAmount = Math.max(0, parseInt(amount) || 0);

  // Perhitungan Pajak Roblox (30% Tax, 70% Revenue)
  let userEarns = 0;
  let taxAmount = 0;
  let requiredPrice = 0;

  if (mode === "earn") {
    userEarns = Math.floor(numAmount * 0.7);
    taxAmount = numAmount - userEarns;
  } else {
    requiredPrice = Math.ceil(numAmount / 0.7);
    taxAmount = requiredPrice - numAmount;
  }

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setPreset = (val: number) => {
    setAmount(val.toString());
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard Tools
        </Link>

        {/* Tool Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg">
            <Calculator className="w-8 h-8 text-[#0ea5e9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                Robux Tax Calculator
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 rounded-md">
                ROBLOX 30% TAX
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kalkulator presisi untuk menghitung potongan pajak marketplace Roblox 30% pada Gamepass dan Developer Product.
            </p>
          </div>
        </div>

        {/* Calculator Main Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-7 bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
              <button
                onClick={() => setMode("earn")}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === "earn"
                    ? "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Hitung Pendapatan
              </button>
              <button
                onClick={() => setMode("target")}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === "target"
                    ? "bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Hitung Target Jual
              </button>
            </div>

            {/* Input Label & Field */}
            <div className="mb-6">
              <label className="block text-xs font-mono text-slate-300 mb-2">
                {mode === "earn"
                  ? "Harga Jual Gamepass / DevProduct (R$):"
                  : "Jumlah Robux Bersih yang Diharapkan (R$):"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-sm text-[#0ea5e9]">
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                />
                {amount && (
                  <button
                    onClick={() => setAmount("")}
                    className="absolute right-4 text-slate-500 hover:text-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="block text-[11px] font-mono text-slate-400 mb-2">
                Pilih Preset Cepat:
              </span>
              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPreset(val)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
                  >
                    {formatNumber(val)} R$
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-4">
                Ringkasan Perhitungan
              </span>

              {mode === "earn" ? (
                <>
                  <div className="mb-6 p-4 rounded-xl bg-[#080b11] border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">
                      Robux Bersih Diterima (70%)
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-[#0ea5e9]">
                        R$ {formatNumber(userEarns)}
                      </span>
                      <button
                        onClick={() => handleCopy(userEarns.toString())}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Salin Angka"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs text-slate-300">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-slate-500" /> Harga Kotor:
                      </span>
                      <span className="font-bold text-white">R$ {formatNumber(numAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-[#f97316]" /> Pajak Roblox (30%):
                      </span>
                      <span className="font-bold text-[#f97316]">- R$ {formatNumber(taxAmount)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 p-4 rounded-xl bg-[#080b11] border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">
                      Harga Jual Minimal (R$)
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-[#f97316]">
                        R$ {formatNumber(requiredPrice)}
                      </span>
                      <button
                        onClick={() => handleCopy(requiredPrice.toString())}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Salin Angka"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs text-slate-300">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-[#0ea5e9]" /> Target Bersih:
                      </span>
                      <span className="font-bold text-white">R$ {formatNumber(numAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-[#f97316]" /> Estimasi Pajak:
                      </span>
                      <span className="font-bold text-[#f97316]">+ R$ {formatNumber(taxAmount)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Information Footnote */}
            <div className="mt-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Roblox memotong 30% dari setiap transaksi. Hasil dibulatkan ke bawah (*floor*) sesuai sistem pembayaran resmi Roblox.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
