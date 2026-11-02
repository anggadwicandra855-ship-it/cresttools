"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Mail, Shield, Key, LogOut, Sparkles, ExternalLink } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data.user) {
                router.push("/login");
            } else {
                setUser(data.user);
            }
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#080b11]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) return null;

    const metadata = user.user_metadata || {};
    const provider = user.app_metadata?.provider || "OAuth";

    return (
        <main className="min-h-screen bg-[#080b11] pt-28 pb-16 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Profile Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d131f]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                        {/* Avatar */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={metadata.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
                            alt="Profile Avatar"
                            className="h-24 w-24 rounded-full border-2 border-sky-500/40 object-cover shadow-lg shadow-sky-500/10"
                        />

                        {/* Info User */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-2xl font-bold text-white font-sans">
                                    {metadata.full_name || "Developer"}
                                </h1>
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/30 px-3 py-0.5 text-xs font-mono font-bold text-sky-400">
                                    <Sparkles className="h-3 w-3" /> FREE TIER
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2">
                                <Mail className="h-4 w-4 text-slate-500" /> {user.email}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                                Provider Login: <span className="text-slate-300 capitalize">{provider}</span>
                            </p>
                        </div>

                        {/* Tombol Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:border-red-500/40"
                        >
                            <LogOut className="h-4 w-4" /> Keluar
                        </button>
                    </div>
                </div>

                {/* Grid Stats & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0d131f]/60 p-5 backdrop-blur-xl space-y-3">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                            <Shield className="h-4 w-4 text-sky-400" /> Status Akun
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Akses Platform</p>
                            <p className="text-sm font-bold text-emerald-400 font-mono">AKTIF & TERVERIFIKASI</p>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-slate-800">
                            <p className="text-xs text-slate-400">ID Pengguna</p>
                            <p className="text-[11px] font-mono text-slate-400 truncate">{user.id}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0d131f]/60 p-5 backdrop-blur-xl space-y-3">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                            <Key className="h-4 w-4 text-orange-400" /> Kuota AI & API Tools
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Penggunaan Token Harian</p>
                            <p className="text-sm font-bold text-white font-mono">0 / 500 Token</p>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-sky-500 h-full w-[0%]" />
                        </div>
                    </div>
                </div>

                {/* Banner Upgrade Pro / Next Feature */}
                <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 to-blue-600/10 p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-white font-bold text-sm">Ingin Akses Tools Tanpa Batas?</h3>
                        <p className="text-xs text-slate-400 mt-1">Upgrade ke Tier Pro untuk akses fitur tak terbatas dan regenerasi cepat.</p>
                    </div>
                    <button className="shrink-0 flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs font-bold px-4 py-2.5 transition-all shadow-lg shadow-sky-500/20">
                        Segera Hadir <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </main>
    );
}