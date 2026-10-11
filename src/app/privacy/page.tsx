import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Database, Key, UserCheck, Trash2 } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi - CrestTools",
  description: "Kebijakan privasi dan perlindungan data pengguna di CrestTools.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigasi Kembali */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Dokumen Legalitas
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kebijakan Privasi
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Terakhir diperbarui: 11 Oktober 2026. Transparansi pengelolaan data Anda di platform CrestTools.
          </p>
        </div>

        {/* Konten Utama */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-sky-400 font-semibold text-lg">
              <UserCheck className="w-5 h-5" />
              <h2>1. Data yang Kami Kumpulkan</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              CrestTools hanya mengumpulkan informasi profil publik dasar yang diberikan secara sukarela saat Anda masuk melalui penyedia autentikasi pihak ketiga (seperti Google atau Discord). Data ini mencakup alamat email, nama tampilan, dan foto profil.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-sky-400 font-semibold text-lg">
              <Database className="w-5 h-5" />
              <h2>2. Tujuan Penggunaan Data</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Informasi profil Anda digunakan khusus untuk identifikasi sesi akun di platform, menampilkan identitas pada dasbor pengguna, serta mencatat alokasi kuota/token penggunaan tools harian Anda.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400 font-semibold text-lg">
              <Key className="w-5 h-5" />
              <h2>3. Keamanan Roblox API Key</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Semua kunci akses (Roblox Open Cloud API Key) yang Anda masukkan disimpan secara lokal di <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">localStorage</code> browser Anda. Kunci ini dikirim langsung ke server backend hanya saat proses upload berlangsung dan <strong>tidak pernah disimpan permanen</strong> di database server kami.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-sky-400 font-semibold text-lg">
              <Lock className="w-5 h-5" />
              <h2>4. Kebijakan Pihak Ketiga & Infrastruktur</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Kami menggunakan layanan Supabase untuk manajemen autentikasi yang aman. CrestTools berkomitmen penuh untuk <strong>tidak pernah menjual, menyewakan, atau membagikan</strong> data pribadi Anda kepada pihak mana pun untuk keperluan pemasaran atau iklan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-semibold text-lg">
              <Trash2 className="w-5 h-5" />
              <h2>5. Hak Pengguna & Penghapusan Akun</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Anda berhak meminta penghapusan akun beserta seluruh riwayat alokasi token dari sistem kami kapan saja. Untuk pengajuan penghapusan data, Anda dapat menghubungi tim pengembang melalui menu Pengaturan Pengguna.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
