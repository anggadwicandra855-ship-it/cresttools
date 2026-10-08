"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wrench,
  Settings,
  Sparkles,
  Key,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cek status API Key dari LocalStorage
  useEffect(() => {
    const checkCreds = () => {
      const saved = localStorage.getItem("crest_roblox_credentials");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHasApiKey(Boolean(parsed.apiKey && parsed.creatorId));
        } catch {
          setHasApiKey(false);
        }
      } else {
        setHasApiKey(false);
      }
    };

    checkCreds();
    window.addEventListener("storage", checkCreds);
    return () => window.removeEventListener("storage", checkCreds);
  }, [pathname]);

  const navLinks = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Tools Studio", href: "/tools", icon: Wrench },
    { name: "Skybox 3D", href: "/tools/skybox-converter", icon: Sparkles },
  ];

  return (
    <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Floating Apple-Style Glassmorphism Container */}
      <nav className="relative flex items-center justify-between px-4 py-2.5 rounded-full bg-[#0d131f]/70 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-black/50 transition-all duration-300 hover:border-slate-700/80">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 pl-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0ea5e9] via-[#38bdf8] to-[#f97316] p-[1.5px] shadow-lg shadow-[#0ea5e9]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080b11] rounded-full flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#f97316] font-black text-xs tracking-tighter">
                CT
              </span>
            </div>
          </div>
          <span className="text-sm font-black tracking-wider text-white group-hover:text-[#0ea5e9] transition-colors">
            Crest<span className="text-[#0ea5e9]">Tools</span>
          </span>
        </Link>

        {/* Desktop Menu Tabs (Apple Pill + Active Neon Strip) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/50 p-1 rounded-full border border-slate-800/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 group ${
                  isActive
                    ? "text-white bg-slate-800/80 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? "text-[#0ea5e9]" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span>{link.name}</span>

                {/* Active Indicator Underline Strip */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-gradient-to-r from-[#0ea5e9] to-[#f97316] rounded-full shadow-[0_0_8px_#0ea5e9]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Button & API Indicator */}
        <div className="hidden md:flex items-center gap-3 pr-1">
          <Link
            href="/settings"
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              pathname === "/settings"
                ? "bg-[#0ea5e9]/20 border-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <span>API Roblox</span>
            
            {/* Status Dot */}
            <span className="relative flex h-2 w-2 ml-1">
              {hasApiKey ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl bg-[#0d131f]/95 border border-slate-800/80 backdrop-blur-2xl shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                onClick={() => setMobileMenuOpen(false)}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800/80">
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/settings"
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#0ea5e9]" />
                <span>Pengaturan API Roblox</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {hasApiKey ? "Siap" : "Belum Set"}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
