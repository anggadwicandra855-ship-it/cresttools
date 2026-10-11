"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { LIVE_TOOLS } from "@/lib/tools";

// Nyalakan kalau halaman /login sudah ada (Fase 2b).
const SHOW_LOGIN = false;

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorY = useRef(0);

  // Menu "terbuka" disimpan sebagai path tempat dia dibuka.
  // Pindah halaman => path beda => menu otomatis tertutup (tanpa effect tambahan).
  const [toolsPath, setToolsPath] = useState<string | null>(null);
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const toolsOpen = toolsPath === pathname;
  const mobileOpen = mobilePath === pathname;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // ---------- Scroll: tipis di atas, ngumpet pas scroll turun, muncul pas scroll naik ----------
  useEffect(() => {
    anchorY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      if (y <= 80) {
        setHidden(false);
        anchorY.current = y;
        return;
      }
      const diff = y - anchorY.current;
      if (Math.abs(diff) > 10) {
        setHidden(diff > 0);
        anchorY.current = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- Tutup menu: tekan Escape atau klik di luar ----------
  useEffect(() => {
    if (!toolsOpen && !mobileOpen) return;

    const closeAll = () => {
      setToolsPath(null);
      setMobilePath(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) closeAll();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [toolsOpen, mobileOpen]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openTools = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setToolsPath(pathname);
  };
  const scheduleCloseTools = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setToolsPath(null), 140);
  };

  const homeActive = pathname === "/";
  const toolsActive = pathname.startsWith("/tools");

  // Jangan ngumpet kalau ada menu yang lagi kebuka
  const hide = hidden && !toolsOpen && !mobileOpen;

  const underline = (active: boolean) =>
    `pointer-events-none absolute inset-x-3 -bottom-0.5 h-px origin-left bg-gradient-to-r from-[#0ea5e9] to-[#f97316] transition-transform duration-300 ${
      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
    }`;

  return (
    <header
      ref={headerRef}
      className={`sticky top-3 z-50 mx-auto w-full max-w-5xl px-3 transition-transform duration-300 sm:px-6 ${
        hide ? "-translate-y-[140%]" : "translate-y-0"
      }`}
    >
      <nav
        aria-label="Navigasi utama"
        className={`relative flex items-center justify-between rounded-full border px-3 py-2 backdrop-blur-xl transition-colors duration-300 ${
          scrolled
            ? "border-white/10 bg-[#0d131f]/85 shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
            : "border-white/[0.07] bg-[#0d131f]/60 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* highlight tipis di tepi atas (gaya kaca) */}
        <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* ---------- Brand ---------- */}
        <Link
          href="/"
          aria-label="CrestTools — Beranda"
          className="flex items-center rounded-full pl-1 pr-2 transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0ea5e9]"
        >
          <Logo variant="full" priority />
        </Link>

        {/* ---------- Menu desktop ---------- */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            aria-current={homeActive ? "page" : undefined}
            className={`group relative px-3 py-2 text-[13px] font-medium transition-colors ${
              homeActive ? "text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Beranda
            <span className={underline(homeActive)} />
          </Link>

          {/* Tools + dropdown */}
          <div className="relative" onMouseEnter={openTools} onMouseLeave={scheduleCloseTools}>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={toolsOpen}
              onClick={(e) => {
                // klik mouse = buka (hover sudah buka); Enter/Space keyboard = toggle
                setToolsPath(toolsOpen && e.detail === 0 ? null : pathname);
              }}
              className={`group relative flex items-center gap-1 px-3 py-2 text-[13px] font-medium transition-colors ${
                toolsActive || toolsOpen ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Tools
              <ChevronDown
                className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${
                  toolsOpen ? "rotate-180 text-slate-300" : ""
                }`}
              />
              <span className={underline(toolsActive || toolsOpen)} />
            </button>

            {toolsOpen && (
              <div className="nav-pop absolute left-1/2 top-full z-50 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 pt-3">
                <div className="rounded-3xl border border-white/10 bg-[#0d131f]/95 p-3 shadow-2xl backdrop-blur-2xl">
                  <div className="grid grid-cols-2 gap-1">
                    {LIVE_TOOLS.map((tool) => {
                      const Icon = tool.icon;
                      const active = pathname.startsWith(tool.href);
                      return (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          onClick={() => setToolsPath(null)}
                          className={`group flex items-start gap-3 rounded-2xl p-3 transition-colors ${
                            active ? "bg-[#0ea5e9]/10" : "hover:bg-white/[0.05]"
                          }`}
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-[#080b11] group-hover:border-[#0ea5e9]/40">
                            <Icon className="h-4 w-4 text-[#0ea5e9]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold text-white">{tool.title}</span>
                            <span className="block truncate text-[11px] text-slate-400">{tool.short}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href="/tools"
                    onClick={() => setToolsPath(null)}
                    className="mt-2 flex items-center justify-between rounded-2xl border border-slate-800 bg-[#080b11]/70 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
                  >
                    Lihat semua tools
                    <ArrowRight className="h-3.5 w-3.5 text-[#f97316]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Kanan ---------- */}
        <div className="flex items-center gap-2">
          {SHOW_LOGIN ? (
            <Link
  href="/login"
  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-xs font-mono font-bold text-white shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
>
  Masuk
</Link>
          ) : (
            <span className="hidden rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-[#f97316] md:inline-flex">
              BETA
            </span>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobilePath(mobileOpen ? null : pathname)}
            className="rounded-full border border-slate-800 bg-slate-900 p-2 text-slate-300 transition-colors hover:text-white md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* ---------- Drawer mobile ---------- */}
      {mobileOpen && (
        <div className="nav-pop mt-2 max-h-[70vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0d131f]/95 p-3 shadow-2xl backdrop-blur-2xl md:hidden">
          <Link
            href="/"
            onClick={() => setMobilePath(null)}
            className={`block rounded-2xl px-4 py-3 text-[13px] font-semibold ${
              homeActive ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" : "text-slate-300 hover:bg-white/[0.05]"
            }`}
          >
            Beranda
          </Link>

          <p className="px-4 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">Tools</p>
          {LIVE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = pathname.startsWith(tool.href);
            return (
              <Link
                key={tool.id}
                href={tool.href}
                onClick={() => setMobilePath(null)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-medium ${
                  active ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#0ea5e9]" />
                {tool.title}
              </Link>
            );
          })}

          <Link
            href="/tools"
            onClick={() => setMobilePath(null)}
            className="mt-2 flex items-center justify-between rounded-2xl border border-slate-800 bg-[#080b11]/70 px-4 py-3 text-xs font-semibold text-slate-300"
          >
            Lihat semua tools
            <ArrowRight className="h-3.5 w-3.5 text-[#f97316]" />
          </Link>

          {SHOW_LOGIN && (
            <Link
              href="/login"
              onClick={() => setMobilePath(null)}
              className="mt-2 block rounded-2xl bg-white px-4 py-3 text-center text-xs font-bold text-black"
            >
              Masuk
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
