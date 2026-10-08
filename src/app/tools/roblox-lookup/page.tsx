"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  UserSearch,
  ArrowLeft,
  Search,
  User,
  Users,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  IdCard,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface UserResult {
  id: number;
  name: string;
  displayName: string;
  created: string;
  description: string;
  avatarBustUrl: string;
}

interface GroupResult {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  ownerId: number;
  memberCount: number;
  iconUrl: string;
}

export default function RobloxLookupPage() {
  const [activeTab, setActiveTab] = useState<"user" | "group">("user");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserResult | null>(null);
  const [groupData, setGroupData] = useState<GroupResult | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setUserData(null);
    setGroupData(null);

    const cleanQuery = query.trim();

    try {
      const res = await fetch(
        `/api/roblox?type=${activeTab}&query=${encodeURIComponent(cleanQuery)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengambil data dari Roblox.");
        return;
      }

      if (activeTab === "user") {
        setUserData(data);
      } else {
        setGroupData(data);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan saat menghubungi API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Back */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Katalog Tools
        </Link>

        {/* Tool Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg">
            <UserSearch className="w-8 h-8 text-[#0ea5e9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                Roblox User & Group Lookup
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 rounded-md">
                LIVE API
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cek profil akun asli, avatar 3D, tanggal bergabung, dan data grup Roblox secara langsung dari API resmi.
            </p>
          </div>
        </div>

        {/* Search Box & Switcher Tabs */}
        <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 backdrop-blur-md">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => {
                setActiveTab("user");
                setUserData(null);
                setGroupData(null);
                setErrorMsg(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "user"
                  ? "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              Cari User Roblox
            </button>
            <button
              onClick={() => {
                setActiveTab("group");
                setUserData(null);
                setGroupData(null);
                setErrorMsg(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "group"
                  ? "bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Cari Group Roblox
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeTab === "user"
                    ? "Masukkan Username atau User ID asli kamu..."
                    : "Masukkan Group ID asli (misal: 1)..."
                }
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#f97316] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Cari Data
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* User Result Profile Card */}
        {userData && activeTab === "user" && (
          <div className="bg-[#161f32]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#0ea5e9] to-[#f97316]" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Render */}
              <div className="w-36 h-36 rounded-2xl bg-slate-900 border border-slate-700 p-2 flex items-center justify-center shrink-0 relative group shadow-inner">
                {userData.avatarBustUrl ? (
                  <img
                    src={userData.avatarBustUrl}
                    alt={userData.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <User className="w-16 h-16 text-slate-600" />
                )}
                <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h2 className="text-2xl font-black text-white tracking-wide">
                      {userData.displayName}
                    </h2>
                    <span className="text-xs font-mono text-slate-400">
                      (@{userData.name})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {userData.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block mb-0.5 flex items-center gap-1">
                      <IdCard className="w-3 h-3 text-[#0ea5e9]" /> User ID:
                    </span>
                    <span className="font-bold text-white">{userData.id}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block mb-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#f97316]" /> Bergabung:
                    </span>
                    <span className="font-bold text-slate-200">{userData.created}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" /> Status:
                    </span>
                    <span className="font-bold text-emerald-400">Terverifikasi API</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <button
                    onClick={() => handleCopy(userData.id.toString(), "id")}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-slate-200 flex items-center gap-2 transition-colors"
                  >
                    {copiedText === "id" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" /> ID Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin ID
                      </>
                    )}
                  </button>

                  <a
                    href={`https://www.roblox.com/users/${userData.id}/profile`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 text-xs font-mono font-bold text-[#0ea5e9] flex items-center gap-2 transition-colors"
                  >
                    Buka Profil Roblox <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group Result Card */}
        {groupData && activeTab === "group" && (
          <div className="bg-[#161f32]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#f97316] to-[#0ea5e9]" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Group Logo */}
              <div className="w-28 h-28 rounded-2xl bg-slate-900 border border-slate-700 p-2 flex items-center justify-center shrink-0 shadow-inner">
                {groupData.iconUrl ? (
                  <img
                    src={groupData.iconUrl}
                    alt={groupData.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <Users className="w-12 h-12 text-[#f97316]" />
                )}
              </div>

              {/* Group Details */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {groupData.name}
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {groupData.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Group ID:</span>
                    <span className="font-bold text-white">{groupData.id}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Pemilik (Owner):</span>
                    <span className="font-bold text-[#0ea5e9]">{groupData.ownerName}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Total Anggota:</span>
                    <span className="font-bold text-[#f97316]">
                      {groupData.memberCount.toLocaleString("id-ID")} Members
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <button
                    onClick={() => handleCopy(groupData.id.toString(), "groupId")}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-slate-200 flex items-center gap-2 transition-colors"
                  >
                    {copiedText === "groupId" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" /> ID Group Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin Group ID
                      </>
                    )}
                  </button>

                  <a
                    href={`https://www.roblox.com/groups/${groupData.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#f97316]/10 hover:bg-[#f97316]/20 border border-[#f97316]/30 text-xs font-mono font-bold text-[#f97316] flex items-center gap-2 transition-colors"
                  >
                    Buka Halaman Group <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
