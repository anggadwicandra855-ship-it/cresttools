"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  ArrowLeft,
  Key,
  User,
  Users,
  Save,
  Check,
  ShieldCheck,
  Trash2,
  Eye,
  EyeOff,
  Info,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface RobloxCredentials {
  apiKey: string;
  creatorType: "User" | "Group";
  creatorId: string;
}

export const STORAGE_KEY = "crest_roblox_credentials";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [creatorType, setCreatorType] = useState<"User" | "Group">("User");
  const [creatorId, setCreatorId] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: RobloxCredentials = JSON.parse(saved);
        setApiKey(parsed.apiKey || "");
        setCreatorType(parsed.creatorType || "User");
        setCreatorId(parsed.creatorId || "");
      } catch (e) {
        console.error("Gagal membaca credentials dari localStorage", e);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const creds: RobloxCredentials = {
      apiKey: apiKey.trim(),
      creatorType,
      creatorId: creatorId.trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClear = () => {
    if (confirm("Yakin mau hapus credential Roblox dari browser ini, Bree?")) {
      localStorage.removeItem(STORAGE_KEY);
      setApiKey("");
      setCreatorType("User");
      setCreatorId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#0ea5e9] selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Katalog Tools
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <Key className="w-8 h-8 text-[#0ea5e9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                Pengaturan API Roblox
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                UNIVERSAL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Simpan Open Cloud API Key untuk auto-upload otomatis ke Roblox Creator Dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Keamanan Client-Side (100% Private)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Disimpan di LocalStorage
              </span>
            </div>

            {/* Target Creator Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Tipe Kreator Target
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCreatorType("User")}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    creatorType === "User"
                      ? "bg-[#0ea5e9]/10 border-[#0ea5e9] text-[#0ea5e9] shadow-lg shadow-[#0ea5e9]/10"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <User className="w-4 h-4" /> Akun Pribadi (User)
                </button>
                <button
                  type="button"
                  onClick={() => setCreatorType("Group")}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    creatorType === "Group"
                      ? "bg-[#f97316]/10 border-[#f97316] text-[#f97316] shadow-lg shadow-[#f97316]/10"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Users className="w-4 h-4" /> Komunitas / Group
                </button>
              </div>
            </div>

            {/* Creator ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {creatorType === "User" ? "User ID Roblox Lu" : "Group ID Roblox Lu"}
              </label>
              <input
                type="text"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                placeholder={
                  creatorType === "User"
                    ? "Contoh: 123456789 (UserID)"
                    : "Contoh: 987654321 (GroupID)"
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0ea5e9] transition-colors font-mono"
                required
              />
            </div>

            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  Roblox Open Cloud API Key
                </label>
                <a
                  href="https://create.roblox.com/dashboard/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-[#0ea5e9] hover:underline flex items-center gap-1"
                >
                  Ambil API Key di Creator Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="rbx_api_key_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0ea5e9] transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#0ea5e9]" /> Syarat Akses API Key Roblox:
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside font-mono">
                <li>Izin API (Permissions): Tambahkan <span className="text-emerald-400">Assets API (Write)</span>.</li>
                <li>IP Restriction: Isi dengan <span className="text-amber-400">0.0.0.0/0</span> agar bisa diakses fleksibel dari Vercel/HP.</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Hapus Credentials
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#f97316] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#0ea5e9]/20 transition-all active:scale-95"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Tersimpan Sempurna!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
