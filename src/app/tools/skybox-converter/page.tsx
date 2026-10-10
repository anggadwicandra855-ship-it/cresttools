"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import SkyboxPreview from "@/components/skybox/SkyboxPreview";
import JSZip from "jszip";
import {
  convertEquirectToSkybox,
  applyFaceConfig,
  generateTestPanorama,
  DEFAULT_FACE_CONFIG,
  NEUTRAL_FACE_CONFIG,
  SkyboxFace,
  FaceConfig,
} from "@/utils/skyboxConverter";
import {
  ImageIcon,
  ArrowLeft,
  Upload,
  Sparkles,
  Copy,
  Check,
  Eye,
  FileImage,
  RefreshCcw,
  Maximize2,
  Loader2,
  Box,
  Code2,
  CloudUpload,
  Settings,
  Sliders,
  Layers,
  Wand2,
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface SkyboxPreset {
  id: string;
  name: string;
  category: string;
  prompt: string;
  previewUrl: string;
}

const AI_PRESETS: SkyboxPreset[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon City",
    category: "Sci-Fi",
    prompt: "360 equirectangular skybox, futuristic cyberpunk city at night, glowing cyan magenta skyscrapers, volumetric fog --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&q=80",
  },
  {
    id: "anime-sunset",
    name: "Anime Afternoon Sunset",
    category: "Anime",
    prompt: "360 equirectangular skybox, makoto shinkai style, golden hour anime clouds, vibrant orange and blue sky --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80",
  },
  {
    id: "deep-space",
    name: "Deep Space Nebula",
    category: "Space",
    prompt: "360 equirectangular skybox, deep cosmic outer space, glowing purple magenta nebula, distant twinkling stars --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=80",
  },
  {
    id: "fantasy-islands",
    name: "Celestial Floating Isles",
    category: "Fantasy",
    prompt: "360 equirectangular skybox, epic fantasy sky, floating magical crystal islands, soft ambient sunlight --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80",
  },
  {
    id: "overcast-storm",
    name: "Overcast Thunderstorm",
    category: "Weather",
    prompt: "360 equirectangular skybox, dark dramatic thunderstorm clouds, realistic lightning strikes, moody atmosphere --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600&q=80",
  },
  {
    id: "golden-alps",
    name: "Golden Hour Alps",
    category: "Nature",
    prompt: "360 equirectangular skybox, snow mountain peak horizon, golden hour sunset glow, ultra realistic --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  },
  {
    id: "pixel-sky",
    name: "Retro 16-Bit Pixel Sky",
    category: "Pixel Art",
    prompt: "360 equirectangular skybox, 16-bit pixel art style, sunset gradient sky with pixel clouds, retro game aesthetic --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&q=80",
  },
  {
    id: "pastel-dream",
    name: "Pastel Dreamcore",
    category: "Dreamcore",
    prompt: "360 equirectangular skybox, soft pastel cotton candy clouds, pink and lavender gradient sky, dreamcore aesthetic --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80",
  },
  {
    id: "alien-planet",
    name: "Alien Exoplanet Sky",
    category: "Sci-Fi",
    prompt: "360 equirectangular skybox, alien planet horizon, dual moons in sky, bioluminescent atmosphere, sci-fi --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80",
  },
  {
    id: "tropical-dusk",
    name: "Tropical Dusk Ocean",
    category: "Realism",
    prompt: "360 equirectangular skybox, calm ocean horizon at dusk, vibrant purple crimson sunset sky --ar 2:1",
    previewUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
  },
];

const FACE_LIST: { key: SkyboxFace; label: string }[] = [
  { key: "up", label: "SkyboxUp" },
  { key: "dn", label: "SkyboxDn" },
  { key: "lf", label: "SkyboxLf" },
  { key: "rt", label: "SkyboxRt" },
  { key: "ft", label: "SkyboxFt" },
  { key: "bk", label: "SkyboxBk" },
];

// Tag versi: tampil di layar + console, buat mastiin build terbaru yang jalan.
const BUILD_TAG = "build v4.1";

// v2: default baru (mapping hasil tes Studio). Key lama diabaikan.
const FACE_CONFIG_KEY = "crest_skybox_face_config_v2";

type UploadState = "idle" | "uploading" | "success" | "error";
interface FaceUploadStatus {
  state: UploadState;
  message?: string;
  moderation?: string | null;
  assetType?: string;
}

const emptyIds = (): Record<SkyboxFace, string> => ({
  up: "", dn: "", lf: "", rt: "", ft: "", bk: "",
});

const emptyStatus = (): Record<SkyboxFace, FaceUploadStatus> => ({
  up: { state: "idle" },
  dn: { state: "idle" },
  lf: { state: "idle" },
  rt: { state: "idle" },
  ft: { state: "idle" },
  bk: { state: "idle" },
});

const cloneConfig = (cfg: Record<SkyboxFace, FaceConfig>): Record<SkyboxFace, FaceConfig> =>
  JSON.parse(JSON.stringify(cfg));

// Script Luau siap pakai. IDs = ID slot Roblox (sudah benar karena swap terjadi sebelum upload).
const buildLua = (ids: Record<SkyboxFace, string>) => `-- Crest Tools - Skybox (siap pakai)
-- Cara pakai: Studio > View > Command Bar > paste > Enter.
-- (Kalau dijadikan Script biasa, Sky cuma kebentuk saat Play.)

local Lighting = game:GetService("Lighting")
local InsertService = game:GetService("InsertService")

local IDS = {
  Bk = ${ids.bk},
  Dn = ${ids.dn},
  Ft = ${ids.ft},
  Lf = ${ids.lf},
  Rt = ${ids.rt},
  Up = ${ids.up},
}

-- Kalau ID bertipe Decal, ambil ID gambar aslinya.
-- Kalau gagal / sudah ID gambar, pakai ID apa adanya.
local function resolve(id)
  local ok, model = pcall(function()
    return InsertService:LoadAsset(id)
  end)
  if ok and model then
    local decal = model:FindFirstChildWhichIsA("Decal", true)
    local tex = decal and decal.Texture or ""
    model:Destroy()
    if tex ~= "" then
      return tex
    end
  end
  return "rbxassetid://" .. id
end

-- Hapus Sky lama biar ga tabrakan
for _, child in ipairs(Lighting:GetChildren()) do
  if child:IsA("Sky") then
    child:Destroy()
  end
end

local sky = Instance.new("Sky")
sky.Name = "CrestSky"

local PROPS = {
  Bk = "SkyboxBk",
  Dn = "SkyboxDn",
  Ft = "SkyboxFt",
  Lf = "SkyboxLf",
  Rt = "SkyboxRt",
  Up = "SkyboxUp",
}

for face, prop in pairs(PROPS) do
  local value = resolve(IDS[face])
  sky[prop] = value
  print(("[CrestSky] %s -> %s"):format(prop, value))
end

sky.Parent = Lighting
print("[CrestSky] Sky terpasang!")
`;

const getAndClearIndexedDB = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) return resolve(null);
    const request = indexedDB.open("CrestToolsDB", 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("bridge")) {
        request.result.createObjectStore("bridge");
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("bridge")) return resolve(null);
      const tx = db.transaction("bridge", "readwrite");
      const store = tx.objectStore("bridge");
      const getReq = store.get("crest_bridge_image");
      getReq.onsuccess = () => {
        const val = getReq.result || null;
        if (val) store.delete("crest_bridge_image");
        resolve(val);
      };
      getReq.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
};

const dataURItoBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

export default function SkyboxConverterPage() {
  const [activeTab, setActiveTab] = useState<"convert" | "stitch" | "prompts">("convert");
  const [isProcessing, setIsProcessing] = useState(false);

  // sourceUrl   : panorama 2:1
  // idealFaces  : 6 face dari converter -> PREVIEW
  // exportFaces : idealFaces + penyesuaian slot Roblox -> ZIP / UPLOAD / thumbnail
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [idealFaces, setIdealFaces] = useState<Record<SkyboxFace, string> | null>(null);
  const [exportFaces, setExportFaces] = useState<Record<SkyboxFace, string> | null>(null);
  const [faceConfig, setFaceConfig] = useState<Record<SkyboxFace, FaceConfig>>(() =>
    cloneConfig(DEFAULT_FACE_CONFIG)
  );

  const [yawOffset, setYawOffset] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const [stitchImages, setStitchImages] = useState<Record<SkyboxFace, string>>(emptyIds());

  // Hasil upload (ID slot Roblox + status per sisi)
  const [robloxIds, setRobloxIds] = useState<Record<SkyboxFace, string>>(emptyIds());
  const [uploadStatus, setUploadStatus] = useState<Record<SkyboxFace, FaceUploadStatus>>(emptyStatus());

  const [copiedLua, setCopiedLua] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertReqRef = useRef(0);
  const exportReqRef = useRef(0);

  useEffect(() => {
    console.log(`[CrestTools] Skybox page ${BUILD_TAG}`);
  }, []);

  // ---------- Load konfigurasi tersimpan ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FACE_CONFIG_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const merged = cloneConfig(DEFAULT_FACE_CONFIG);
        (Object.keys(merged) as SkyboxFace[]).forEach((k) => {
          if (saved?.[k]) merged[k] = { ...merged[k], ...saved[k] };
        });
        setFaceConfig(merged);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  const persistConfig = (cfg: Record<SkyboxFace, FaceConfig>) => {
    try {
      localStorage.setItem(FACE_CONFIG_KEY, JSON.stringify(cfg));
    } catch {
      /* abaikan */
    }
  };

  const updateFaceConfig = (face: SkyboxFace, patch: Partial<FaceConfig>) => {
    setFaceConfig((prev) => {
      const next = { ...prev, [face]: { ...prev[face], ...patch } };
      persistConfig(next);
      return next;
    });
  };

  const replaceFaceConfig = (next: Record<SkyboxFace, FaceConfig>) => {
    const cloned = cloneConfig(next);
    setFaceConfig(cloned);
    persistConfig(cloned);
  };

  const swapLeftRight = () => {
    const next = cloneConfig(faceConfig);
    next.lf.source = faceConfig.rt.source;
    next.rt.source = faceConfig.lf.source;
    replaceFaceConfig(next);
  };

  // ---------- Bridge dari tools lain ----------
  useEffect(() => {
    getAndClearIndexedDB().then((b) => {
      if (b) setSourceUrl(b);
    });
  }, []);

  // ---------- Convert (debounced, anti-balapan) ----------
  useEffect(() => {
    if (!sourceUrl) return;
    const id = ++convertReqRef.current;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const faces = await convertEquirectToSkybox(sourceUrl, 1024, yawOffset);
        if (id === convertReqRef.current) setIdealFaces(faces);
      } catch (e) {
        console.error("Gagal mengolah skybox:", e);
      } finally {
        if (id === convertReqRef.current) setIsProcessing(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [sourceUrl, yawOffset]);

  // ---------- Terapin penyesuaian slot Roblox ----------
  useEffect(() => {
    if (!idealFaces) {
      setExportFaces(null);
      return;
    }
    const id = ++exportReqRef.current;
    applyFaceConfig(idealFaces, faceConfig)
      .then((res) => {
        if (id === exportReqRef.current) setExportFaces(res);
      })
      .catch((e) => console.error("Gagal terapin penyesuaian face:", e));
  }, [idealFaces, faceConfig]);

  // ---------- Hasil upload lama jadi basi kalau gambar/config berubah ----------
  useEffect(() => {
    setRobloxIds(emptyIds());
    setUploadStatus(emptyStatus());
  }, [exportFaces, stitchImages]);

  const getTargetFaces = (): Record<SkyboxFace, string> | null => {
    if (activeTab === "stitch") {
      return Object.values(stitchImages).some(Boolean) ? stitchImages : null;
    }
    return exportFaces;
  };

  const handleTestImage = () => {
    setActiveTab("convert");
    setYawOffset(0);
    setSourceUrl(generateTestPanorama(4096));
  };

  const handleAutoUpload = async (onlyFailed: boolean = false) => {
    const targetFaces = getTargetFaces();
    if (!targetFaces) return;

    const savedCreds = localStorage.getItem("crest_roblox_credentials");
    if (!savedCreds) {
      alert("Atur API Key & User/Group ID di menu Pengaturan dulu ya, Bree!");
      return;
    }

    const creds = JSON.parse(savedCreds);
    if (!creds.apiKey || !creds.creatorId) {
      alert("Credentials Roblox belum lengkap. Cek /settings dulu!");
      return;
    }

    const order: SkyboxFace[] = ["ft", "bk", "lf", "rt", "up", "dn"];
    const queue = order.filter(
      (f) => targetFaces[f] && (!onlyFailed || uploadStatus[f].state !== "success")
    );
    if (queue.length === 0) return;

    setIsUploading(true);
    if (!onlyFailed) {
      setRobloxIds(emptyIds());
      setUploadStatus(emptyStatus());
    }

    const timeStamp = Date.now();

    for (let i = 0; i < queue.length; i++) {
      const face = queue[i];
      setUploadStatus((prev) => ({ ...prev, [face]: { state: "uploading" } }));
      setUploadProgress(`Uploading ${face.toUpperCase()} (${i + 1}/${queue.length})...`);

      try {
        const blob = dataURItoBlob(targetFaces[face]);
        const file = new File([blob], `Skybox_${face.toUpperCase()}.png`, { type: "image/png" });

        const formData = new FormData();
        formData.append("apiKey", creds.apiKey);
        formData.append("creatorType", creds.creatorType);
        formData.append("creatorId", creds.creatorId);
        formData.append("name", `CrestSky_${face.toUpperCase()}_${timeStamp}`);
        formData.append("file", file);

        const res = await fetch("/api/roblox/upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.assetId) {
          setRobloxIds((prev) => ({ ...prev, [face]: String(data.assetId) }));
          setUploadStatus((prev) => ({
            ...prev,
            [face]: { state: "success", moderation: data.moderationState, assetType: data.assetType },
          }));
        } else {
          setUploadStatus((prev) => ({
            ...prev,
            [face]: { state: "error", message: data.error || `Gagal upload (HTTP ${res.status})` },
          }));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal terhubung ke server";
        setUploadStatus((prev) => ({ ...prev, [face]: { state: "error", message } }));
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
  };

  const allIdsReady = FACE_LIST.every((f) => robloxIds[f.key]);
  const uploadTouched = Object.values(uploadStatus).some((s) => s.state !== "idle");
  const hasFailed = Object.values(uploadStatus).some((s) => s.state === "error");
  const pendingModeration = Object.values(uploadStatus).some(
    (s) => s.state === "success" && s.moderation && s.moderation !== "APPROVED"
  );
  const generatedLua = allIdsReady ? buildLua(robloxIds) : "";

  const handleZipDownload = async () => {
    const targetFaces = getTargetFaces();
    if (!targetFaces) return;

    const zip = new JSZip();
    const folder = zip.folder("crest-skybox");
    Object.entries(targetFaces).forEach(([key, dataUrl]) => {
      if (dataUrl) {
        const base64 = dataUrl.split(",")[1];
        folder?.file(`Skybox${key.toUpperCase()}.png`, base64, { base64: true });
      }
    });

    // Script cuma masuk ZIP kalau semua ID sudah ada (hasil upload)
    if (allIdsReady) folder?.file("SkyboxScript.lua", generatedLua);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crest-skybox-v10-${Date.now()}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#0ea5e9]"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Link>

          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-[#0ea5e9]" />
            Pengaturan API Roblox
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <ImageIcon className="w-8 h-8 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Skybox Converter 3D{" "}
              <span className="text-[10px] align-super px-2.5 py-1 rounded-md bg-emerald-500 text-black font-extrabold tracking-wider">
                V10 ULTIMATE
              </span>{" "}
              <span className="text-[10px] align-super px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono font-bold tracking-wider">
                {BUILD_TAG}
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Roblox Native Matrix + Live Horizon Alignment + AI Prompt Library
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 p-1.5 bg-[#161f32]/80 border border-slate-800 rounded-2xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab("convert")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "convert"
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Convert Panorama
          </button>

          <button
            onClick={() => setActiveTab("stitch")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "stitch"
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Gabung 6 Sisi
          </button>

          <button
            onClick={() => setActiveTab("prompts")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "prompts"
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            AI Prompt Library (10)
          </button>
        </div>

        {/* TAB 1: CONVERT PANORAMA */}
        {activeTab === "convert" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6">
                <span className="text-xs font-mono text-slate-400">1. UPLOAD PANORAMA</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = (ev) => setSourceUrl(ev.target?.result as string);
                      r.readAsDataURL(f);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 border-2 border-dashed border-slate-700 hover:border-emerald-400 bg-slate-950/60 rounded-xl p-8 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs font-bold">Klik Upload Panorama (Rasio 2:1)</p>
                </div>

                <button
                  onClick={handleTestImage}
                  className="mt-3 w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  Generate Gambar Tes (Kalibrasi)
                </button>

                {/* HORIZON YAW ROTATION SLIDER */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <label className="text-xs font-mono text-slate-300 flex justify-between mb-2">
                    <span>Geser Horizon (Yaw Alignment):</span>
                    <span className="text-emerald-400 font-bold">{yawOffset}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={yawOffset}
                    onChange={(e) => setYawOffset(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Geser slider untuk memutar arah panorama (pindahin posisi jahitan / arah depan).
                  </p>
                </div>

                {isProcessing && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing V10 Bilinear Slices...
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-[#161f32]/80 border border-slate-800 rounded-2xl p-3">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    2. 360° POV REAL PREVIEW
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        autoRotate ? "bg-emerald-500 text-black shadow-md" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <RefreshCcw className="w-3 h-3 inline mr-1" />
                      Auto Rotate
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById("viewer-full");
                        if (el) el.requestFullscreen();
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white"
                    >
                      <Maximize2 className="w-3 h-3 inline mr-1" />
                      Fullscreen
                    </button>
                  </div>
                </div>
                <div
                  id="viewer-full"
                  className="w-full h-[380px] bg-black rounded-xl overflow-hidden border border-slate-800"
                >
                  <SkyboxPreview
                    faces={idealFaces}
                    panoramaUrl={sourceUrl}
                    autoRotate={autoRotate}
                  />
                </div>
                <p className="text-[10px] text-slate-500 px-3 pt-2">
                  Preview nunjukin hasil sky yang seharusnya. Scroll mouse = zoom, drag = putar.
                </p>
              </div>
            </div>

            {/* HASIL 6 SISI */}
            <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <span className="text-xs font-mono text-slate-400">3. HASIL 6 SISI + EXPORT CLOUD</span>

                {exportFaces && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAutoUpload(false)}
                      disabled={isUploading}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#f97316] text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {uploadProgress || "Uploading..."}
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4" />
                          Auto Upload ke Roblox Studio
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleZipDownload}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
                    >
                      <Box className="w-4 h-4" />
                      Download ZIP
                    </button>
                  </div>
                )}
              </div>

              {exportFaces ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {FACE_LIST.map((f) => (
                    <div key={f.key} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-800 mb-2">
                        <img src={exportFaces[f.key]} alt={f.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="block text-center text-xs font-mono font-bold">Slot {f.label}</span>
                      <span className="block text-center text-[10px] font-mono text-slate-500 mb-2">
                        {faceConfig[f.key].source === f.key
                          ? "isi: arah " + f.key.toUpperCase()
                          : "← isi: arah " + faceConfig[f.key].source.toUpperCase()}
                        {faceConfig[f.key].rotate ? ` · ${faceConfig[f.key].rotate}°` : ""}
                      </span>
                      <button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = exportFaces[f.key];
                          a.download = `${f.label}.png`;
                          a.click();
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-emerald-400 flex items-center justify-center gap-1 transition-colors"
                      >
                        <FileImage className="w-3 h-3" />
                        PNG
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs font-mono text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  Upload panorama untuk memotong 6 sisi tekstur.
                </div>
              )}
            </div>

            {/* PANEL PENYESUAIAN SLOT ROBLOX */}
            {idealFaces && (
              <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-slate-400">4. PENYESUAIAN SLOT ROBLOX (per face)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={swapLeftRight}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200"
                    >
                      Tuker Lf ↔ Rt
                    </button>
                    <button
                      onClick={() => replaceFaceConfig(NEUTRAL_FACE_CONFIG)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200"
                    >
                      Netral
                    </button>
                    <button
                      onClick={() => replaceFaceConfig(DEFAULT_FACE_CONFIG)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset (Roblox)
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-4">
                  Default sudah pakai hasil tes Studio: Bk ← Lf, Lf ← Bk, Rt ← Ft, Ft ← Rt. Tersimpan otomatis di
                  browser. Rotasi = searah jarum jam, dilakukan setelah flip.
                </p>

                <div className="space-y-2">
                  {FACE_LIST.map((f) => {
                    const cfg = faceConfig[f.key];
                    return (
                      <div
                        key={f.key}
                        className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2"
                      >
                        <span className="text-xs font-mono font-bold text-emerald-400">Slot {f.label}</span>

                        <label className="text-[10px] font-mono text-slate-400 flex flex-col gap-1">
                          Ambil gambar dari
                          <select
                            value={cfg.source}
                            onChange={(e) => updateFaceConfig(f.key, { source: e.target.value as SkyboxFace })}
                            className="bg-[#080b11] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                          >
                            {FACE_LIST.map((o) => (
                              <option key={o.key} value={o.key}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-[10px] font-mono text-slate-400 flex flex-col gap-1">
                          Rotasi
                          <select
                            value={cfg.rotate}
                            onChange={(e) =>
                              updateFaceConfig(f.key, { rotate: Number(e.target.value) as FaceConfig["rotate"] })
                            }
                            className="bg-[#080b11] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                          >
                            <option value={0}>0°</option>
                            <option value={90}>90°</option>
                            <option value={180}>180°</option>
                            <option value={270}>270°</option>
                          </select>
                        </label>

                        <label className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={cfg.flipX}
                            onChange={(e) => updateFaceConfig(f.key, { flipX: e.target.checked })}
                            className="accent-emerald-500"
                          />
                          Flip X
                        </label>

                        <label className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={cfg.flipY}
                            onChange={(e) => updateFaceConfig(f.key, { flipY: e.target.checked })}
                            className="accent-emerald-500"
                          />
                          Flip Y
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: GABUNG 6 SISI */}
        {activeTab === "stitch" && (
          <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold font-mono text-slate-300 mb-4">Upload 6 Sisi Terpisah</h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Mode ini upload gambar apa adanya ke slot yang sama (tanpa penyesuaian otomatis).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {(["up", "dn", "lf", "rt", "ft", "bk"] as SkyboxFace[]).map((face) => (
                <div key={face} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="block text-xs font-bold uppercase mb-2 text-emerald-400">{face} Face</span>
                  {stitchImages[face] ? (
                    <img src={stitchImages[face]} className="w-full aspect-square rounded-lg object-cover mb-2" />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500 mb-2">
                      Kosong
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = (ev) =>
                          setStitchImages((prev) => ({ ...prev, [face]: ev.target?.result as string }));
                        r.readAsDataURL(file);
                      }
                    }}
                    className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-200"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAutoUpload(false)}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadProgress || "Uploading..."}
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" /> Auto Upload 6 Sisi ke Roblox
                  </>
                )}
              </button>
              <button
                onClick={handleZipDownload}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold"
              >
                Download ZIP
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AI PROMPT LIBRARY */}
        {activeTab === "prompts" && (
          <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#f97316]" />
              Katalog Prompt Skybox Ready-to-Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AI_PRESETS.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex gap-4">
                  <img src={p.previewUrl} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80 line-clamp-2">
                        {p.prompt}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(p.prompt);
                          setCopiedPromptId(p.id);
                          setTimeout(() => setCopiedPromptId(null), 2000);
                        }}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-200 flex items-center gap-1"
                      >
                        {copiedPromptId === p.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedPromptId === p.id ? "Tersalin" : "Copy Prompt"}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("convert");
                          setSourceUrl(p.previewUrl);
                        }}
                        className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold"
                      >
                        Gunakan Gambar Ini
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATUS UPLOAD (muncul setelah upload dimulai) */}
        {uploadTouched && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-[#0ea5e9]" />
                Status Upload ke Roblox
              </h4>
              {Object.values(uploadStatus).some((s) => s.state === "success") && (
                <span
                  className={`text-[10px] font-mono px-2 py-1 rounded-md border ${
                    Object.values(uploadStatus).some((s) => s.assetType)
                      ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10"
                      : "text-red-300 border-red-500/40 bg-red-500/10"
                  }`}
                >
                  {Object.values(uploadStatus).some((s) => s.assetType)
                    ? "route.ts: versi baru ✓"
                    : "route.ts: VERSI LAMA (belum ke-replace)"}
                </span>
              )}
              {hasFailed && !isUploading && (
                <button
                  onClick={() => handleAutoUpload(true)}
                  className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Coba Lagi yang Gagal
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {FACE_LIST.map((f) => {
                const st = uploadStatus[f.key];
                return (
                  <div
                    key={f.key}
                    className="bg-[#080b11] border border-slate-800 rounded-xl px-3 py-2 flex items-start gap-2"
                  >
                    <div className="mt-0.5">
                      {st.state === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {st.state === "error" && <XCircle className="w-4 h-4 text-red-400" />}
                      {st.state === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-[#0ea5e9]" />}
                      {st.state === "idle" && <div className="w-4 h-4 rounded-full border border-slate-700" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold">{f.label}</div>
                      {st.state === "success" && (
                        <div className="text-[11px] font-mono text-slate-400 break-all">
                          ID {robloxIds[f.key]}
                          {st.assetType ? ` · ${st.assetType}` : ""}
                          {st.moderation ? ` · ${st.moderation}` : ""}
                        </div>
                      )}
                      {st.state === "error" && (
                        <div className="text-[11px] text-red-300 break-words">{st.message}</div>
                      )}
                      {st.state === "uploading" && (
                        <div className="text-[11px] text-slate-500">Mengupload...</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {pendingModeration && (
              <div className="mt-3 flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Beberapa asset belum berstatus APPROVED. Sky bisa belum muncul di Roblox sampai moderasi selesai.
              </div>
            )}
          </div>
        )}

        {/* LUA SCRIPT: baru muncul kalau ke-6 ID sudah berhasil di-upload */}
        {allIdsReady && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Script Roblox Siap Pakai
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLua);
                  setCopiedLua(true);
                  setTimeout(() => setCopiedLua(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold flex items-center gap-1 transition-colors hover:bg-emerald-400"
              >
                {copiedLua ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedLua ? "Tersalin" : "Salin Script"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              ID sudah terisi otomatis. Paste di Studio: View → Command Bar → Enter. Cek jendela Output buat lihat
              hasil per sisi.
            </p>
            <pre className="text-[12px] font-mono bg-[#080b11] p-4 rounded-xl border border-slate-800 overflow-x-auto text-slate-300 max-h-[420px]">
              {generatedLua}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
