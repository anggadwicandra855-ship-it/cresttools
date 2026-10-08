"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import {
  Sparkles,
  ArrowLeft,
  Upload,
  Download,
  SlidersHorizontal,
  ArrowRight,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Zap,
  Maximize2,
} from "lucide-react";

// Helper Simpan Gambar Raksasa ke IndexedDB v2 (Aman dari NotFoundError)
const saveToIndexedDB = (dataUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CrestToolsDB", 2); // BUMP KE VERSI 2
    
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("bridge")) {
        request.result.createObjectStore("bridge");
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      // Double check jika store masih gagal dibuat
      if (!db.objectStoreNames.contains("bridge")) {
        return reject(new Error("Store 'bridge' tidak ditemukan."));
      }
      const tx = db.transaction("bridge", "readwrite");
      const store = tx.objectStore("bridge");
      store.put(dataUrl, "crest_bridge_image");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    
    request.onerror = () => reject(request.error);
  });
};

export default function ImageUpscalerPage() {
  const router = useRouter();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [copiedBridge, setCopiedBridge] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDraggingSlider = useRef(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setOriginalImage(dataUrl);
        setUpscaledImage(null);
        processUpscale(dataUrl, scaleFactor);
      };
      reader.readAsDataURL(file);
    }
  };

  const processUpscale = (src: string, factor: number) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const targetWidth = img.width * factor;
      const targetHeight = img.height * factor;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.05 + 128));
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.05 + 128));
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.05 + 128));
        }

        ctx.putImageData(imageData, 0, 0);
        setUpscaledImage(canvas.toDataURL("image/png"));
      }
      setIsProcessing(false);
    };
    img.src = src;
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingSlider.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const container = e.currentTarget.getBoundingClientRect();
    const x = clientX - container.left;
    const percentage = Math.max(0, Math.min(100, (x / container.width) * 100));
    setSliderPosition(percentage);
  };

  const handleSendToSkybox = async () => {
    if (!upscaledImage) return;
    try {
      setCopiedBridge(true);
      await saveToIndexedDB(upscaledImage);
      setTimeout(() => {
        router.push("/tools/skybox-converter");
      }, 500);
    } catch (err) {
      console.error(err);
      alert("Gagal memindahkan gambar ke Skybox Converter. Silakan coba lagi.");
      setCopiedBridge(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 selection:bg-[#f97316] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#0ea5e9] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Katalog Tools
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg">
              <Sparkles className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  AI Image Upscaler & Sharpener
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 rounded-md">
                  INDEXEDDB V2
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Perjelas tekstur, decal, atau gambar panorama Roblox 2x hingga 4x lebih tajam tanpa pecah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setScaleFactor(2);
                if (originalImage) processUpscale(originalImage, 2);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                scaleFactor === 2
                  ? "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              2x Upscale HD
            </button>
            <button
              onClick={() => {
                setScaleFactor(4);
                if (originalImage) processUpscale(originalImage, 4);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                scaleFactor === 4
                  ? "bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              4x Ultra HD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-3">
                1. Upload Gambar Tekstur / Skybox
              </span>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-[#0ea5e9] bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-all group"
              >
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-[#0ea5e9] group-hover:scale-110 transition-all mx-auto mb-2" />
                <p className="text-xs font-bold text-white mb-1">
                  Klik untuk Upload Gambar Tekstur / Skybox
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  Format didukung: PNG, JPG, WEBP
                </p>
              </div>
            </div>

            <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-[#0ea5e9]" />
                  2. Live Comparison (Geser Slider)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {scaleFactor}x Resolution Boost
                </span>
              </div>

              <div
                onMouseDown={() => (isDraggingSlider.current = true)}
                onMouseUp={() => (isDraggingSlider.current = false)}
                onMouseMove={handleSliderMove}
                onTouchStart={() => (isDraggingSlider.current = true)}
                onTouchEnd={() => (isDraggingSlider.current = false)}
                onTouchMove={handleSliderMove}
                className="w-full h-72 sm:h-96 bg-slate-950 rounded-xl overflow-hidden relative select-none touch-none border border-slate-800 flex items-center justify-center cursor-ew-resize"
              >
                {originalImage && upscaledImage ? (
                  <>
                    <img
                      src={upscaledImage}
                      alt="Upscaled"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div
                      className="absolute inset-0 w-full h-full overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={originalImage}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>

                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-lg">
                        <SlidersHorizontal className="w-4 h-4 text-[#0ea5e9]" />
                      </div>
                    </div>

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 text-[10px] font-mono text-slate-300 backdrop-blur-sm z-20">
                      Sebelum (Asli)
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#0ea5e9]/80 text-[10px] font-mono text-white backdrop-blur-sm z-20">
                      Sesudah ({scaleFactor}x Upscale)
                    </span>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-500 font-mono text-xs">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Upload gambar untuk melihat perbandingan tajam piksel
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-2">
                3. Export & Pipeline Actions
              </span>

              {isProcessing ? (
                <div className="text-center py-8 text-xs font-mono text-[#0ea5e9] animate-pulse flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Memproses AI Upscale...
                </div>
              ) : upscaledImage ? (
                <div className="space-y-3">
                  <a
                    href={upscaledImage}
                    download="crest_upscaled_image.png"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4 text-[#0ea5e9]" /> Download Hasil HD (.PNG)
                  </a>

                  <button
                    onClick={handleSendToSkybox}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#f97316] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
                  >
                    {copiedBridge ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" /> Mengalihkan ke Skybox...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" /> Kirim ke Skybox Converter <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    💡 **Tip Pipeline:** Tombol di atas akan mengirim gambar HD ini langsung ke Skybox Converter tanpa terkena batasan ukuran kuota browser.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-xs font-mono text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  Opsi download & pipeline akan muncul setelah gambar diproses.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
