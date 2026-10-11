"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Mail, User, Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Fitur autentikasi email Supabase bakal aktif di tahap berikutnya!\nMode: ${isSignUp ? "Daftar" : "Masuk"}`);
  };

  const handleOAuthLogin = async (provider: "google" | "discord") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });

    if (error) {
      alert(`Gagal login: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glowing Ambient Animated */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/20 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-orange-500/20 blur-[130px] rounded-full pointer-events-none"
      />

      {/* Tombol Kembali ke Beranda */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Beranda
        </Link>
      </motion.div>

      {/* Main Glass Card Container dengan Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[580px] relative z-10 my-12"
      >
        {/* Toggle Tab Mobile */}
        <div className="md:hidden flex border-b border-slate-800/80 bg-slate-950/40 p-1.5 gap-1">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              !isSignUp ? "bg-sky-500/10 text-sky-400 border border-sky-500/30" : "text-slate-400"
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              isSignUp ? "bg-orange-500/10 text-orange-400 border border-orange-500/30" : "text-slate-400"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Panel Sisi Kiri: Banner Info Interaktif */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-950/80 via-slate-900/50 to-slate-950/80 border-r border-slate-800/80 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-info" : "login-info"}
              initial={{ opacity: 0, x: isSignUp ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? 20 : -20 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                CrestTools Auth Beta
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                {isSignUp ? "Mulai Akses Tanpa Batas." : "Selamat Datang Kembali!"}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {isSignUp
                  ? "Buat akun untuk membuka kuota token harian yang lebih besar dan akses fitur eksklusif pengembang Roblox."
                  : "Masuk ke dasbor Anda untuk mengelola skrip, tekstur skybox, dan preferensi akun."}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-sky-400 font-mono">Mode Tamu (Guest)</span>
              <p className="text-slate-400">Anda tetap bisa memakai semua tools tanpa login dengan limit kuota harian standar.</p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>{isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sky-400 hover:text-sky-300 font-semibold font-mono underline underline-offset-4 transition-colors"
              >
                {isSignUp ? "Masuk Sekarang" : "Buat Akun Baru"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Panel Sisi Kanan: Form Input & Social Auth */}
        <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-form" : "login-form"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {isSignUp ? "Buat Akun CrestTools" : "Masuk ke Akun"}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Gunakan akun media sosial atau email Anda.
                </p>
              </div>

              {/* Social Auth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleOAuthLogin("google")}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-200 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleOAuthLogin("discord")}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-200 transition-all"
                >
                  <svg className="w-4 h-4 fill-[#5865F2]" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discord
                </motion.button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#0b0f19] px-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider absolute">
                  atau via email
                </span>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="text-xs font-mono text-slate-400">Nama Tampilan</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="DevRoblox123"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400">Alamat Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full py-3 rounded-xl font-mono text-xs font-bold text-white transition-all shadow-lg ${
                    isSignUp
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20"
                      : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/20"
                  }`}
                >
                  {isSignUp ? "Daftar Akun Baru" : "Masuk ke Akun"}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>

          {/* Footer Legal Links */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="/terms" className="text-slate-300 underline hover:text-orange-400">
              Syarat Layanan
            </Link>{" "}
            dan{" "}
            <Link href="/privacy" className="text-slate-300 underline hover:text-sky-400">
              Kebijakan Privasi
            </Link>{" "}
            CrestTools.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
