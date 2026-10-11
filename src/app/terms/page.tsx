import Link from "next/link";
import { ArrowLeft, FileText, AlertTriangle, Cpu, ShieldAlert, Sparkles } from "lucide-react";

export const metadata = {
  title: "Syarat Layanan - CrestTools",
  description: "Syarat dan ketentuan penggunaan platform CrestTools.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigasi Kembali */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono">
            <FileText className="w-3.5 h-3.5" />
            Ketentuan Layanan
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Syarat Ketentuan
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Aturan dan batasan penggunaan platform pengembang CrestTools.
          </p>
        </div>

        {/* Konten Utama */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-orange-400 font-semibold text-lg">
              <AlertTriangle className="w-5 h-5" />
              <h2>1. Penegasan Status Independen</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              CrestTools adalah platform penyedia alat bantu pengembang (developer tools) independen. CrestTools <strong>tidak terafiliasi, diendors, atau dikelola secara resmi oleh Roblox Corporation</strong>. Seluruh merek dagang Roblox adalah milik sepenuhnya dari Roblox Corporation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-sky-400 font-semibold text-lg">
              <Cpu className="w-5 h-5" />
              <h2>2. Batasan Kuota & Fair Use</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Demi menjaga performa server bagi seluruh pengguna, sistem memberlakukan batas kuota/token harian untuk mode Guest maupun Akun Terdaftar (Free Tier). Penggunaan berlebihan yang terdeteksi dilakukan secara otomatis melalui bot dapat menyebabkan pembatasan akses sementara.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-orange-400 font-semibold text-lg">
              <ShieldAlert className="w-5 h-5" />
              <h2>3. Tanggung Jawab Konten & Aset</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Pengguna bertanggung jawab penuh atas seluruh gambar, tekstur, dan skrip Luau yang diolah serta di-upload ke Roblox Creator Dashboard melalui bantuan tools kami. Pastikan seluruh aset Anda tidak melanggar <em>Roblox Community Standards</em>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-semibold text-lg">
              <AlertTriangle className="w-5 h-5" />
              <h2>4. Larangan Penyalahgunaan</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Dilarang keras melakukan tindakan yang merugikan infrastruktur CrestTools, termasuk eksploitasi celah keamanan, pemindaian otomatis (scraping) berlebihan, atau rekayasa balik (reverse-engineering) pada sistem internal aplikasi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 font-semibold text-lg">
              <Sparkles className="w-5 h-5" />
              <h2>5. Fitur Fase Beta</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Karena platform ini masih dalam fase pengembangan Beta, fitur, alokasi limit, dan antarmuka dapat disesuaikan sewaktu-waktu demi meningkatkan performa dan stabilitas layanan.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
