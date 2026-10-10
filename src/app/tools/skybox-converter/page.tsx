"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import JSZip from "jszip";
import { convertEquirectToSkybox, SkyboxFace } from "@/utils/skyboxConverter";
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
  CheckCircle2,
  CloudUpload,
  Settings,
  Sliders,
  Layers,
  Wand2,
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

function Skybox360Viewer({
  slicedFaces,
  panoramaUrl,
  autoRotate,
  containerId,
}: {
  slicedFaces: Record<SkyboxFace, string> | null;
  panoramaUrl: string | null;
  autoRotate: boolean;
  containerId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.touchAction = "none";
    
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = -0.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;

    const loader = new THREE.TextureLoader();

    if (slicedFaces) {
      // FIX CLAUDE: Fungsi untuk flip tekstur memori khusus buat Web Preview (tanpa sentuh file asli)
      const make = (url: string, flip: "h" | "v") => {
        const t = loader.load(url);
        t.colorSpace = THREE.SRGBColorSpace;
        if (flip === "h") {
          t.wrapS = THREE.RepeatWrapping;
          t.repeat.x = -1;
          t.offset.x = 1;
        } else {
          t.wrapT = THREE.RepeatWrapping;
          t.repeat.y = -1;
          t.offset.y = 1;
        }
        return new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide });
      };

      // Urutan BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
      const materials = [
        make(slicedFaces.rt, "h"), // +X
        make(slicedFaces.lf, "h"), // -X
        make(slicedFaces.up, "v"), // +Y
        make(slicedFaces.dn, "v"), // -Y
        make(slicedFaces.bk, "h"), // +Z
        make(slicedFaces.ft, "h"), // -Z
      ];

      scene.add(new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), materials));
    } else if (panoramaUrl) {
      loader.load(panoramaUrl, (texture: any) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const geometry = new THREE.SphereGeometry(500, 64, 64);
        geometry.scale(-1, 1, 1);
        geometry.rotateY(-Math.PI / 2); // FIX CLAUDE: Sinkronin arah kamera pas upload Sphere Panorama
        const material = new THREE.MeshBasicMaterial({ map: texture });
        scene.add(new THREE.Mesh(geometry, material));
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [slicedFaces, panoramaUrl, autoRotate]);

  if (!panoramaUrl && !slicedFaces)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
        <Maximize2 className="w-8 h-8 mb-2 opacity-50" />
        Upload panorama untuk inspect hasil 6 sisi
      </div>
    );

  return (
    <div
      id={containerId}
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
    />
  );
}

export default function SkyboxConverterPage() {
  const [activeTab, setActiveTab] = useState<"convert" | "stitch" | "prompts">("convert");
  const [isProcessing, setIsProcessing] = useState(false);
  const [slicedFaces, setSlicedFaces] = useState<Record<SkyboxFace, string> | null>(null);
  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null);
  const [yawOffset, setYawOffset] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const [stitchImages, setStitchImages] = useState<Record<SkyboxFace, string>>({
    up: "", dn: "", lf: "", rt: "", ft: "", bk: "",
  });

  const [robloxIds, setRobloxIds] = useState<Record<SkyboxFace, string>>({
    up: "", dn: "", lf: "", rt: "", ft: "", bk: "",
  });

  const [copiedLua, setCopiedLua] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processEquirectangularImage = async (src: string, yaw: number = yawOffset) => {
    setIsProcessing(true);
    setPanoramaUrl(src);
    try {
      const slices = await convertEquirectToSkybox(src, 1024, yaw);
      setSlicedFaces(slices);
    } catch (e) {
      console.error("Gagal mengolah skybox:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    getAndClearIndexedDB().then((b) => {
      if (b) processEquirectangularImage(b);
    });
  }, []);

  useEffect(() => {
    if (panoramaUrl) {
      processEquirectangularImage(panoramaUrl, yawOffset);
    }
  }, [yawOffset]);

  const handleAutoUpload = async () => {
    const targetFaces = slicedFaces || (stitchImages.ft ? stitchImages : null);
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

    setIsUploading(true);
    const faces: SkyboxFace[] = ["ft", "bk", "lf", "rt", "up", "dn"];
    const updatedIds = { ...robloxIds };
    const timeStamp = Date.now();

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      if (!targetFaces[face]) continue;

      setUploadProgress(`Uploading ${face.toUpperCase()} (${i + 1}/6)...`);

      const blob = dataURItoBlob(targetFaces[face]);
      const file = new File([blob], `Skybox_${face.toUpperCase()}.png`, { type: "image/png" });

      const formData = new FormData();
      formData.append("apiKey", creds.apiKey);
      formData.append("creatorType", creds.creatorType);
      formData.append("creatorId", creds.creatorId);
      formData.append("name", `CrestSky_${face.toUpperCase()}_${timeStamp}`);
      formData.append("file", file);

      try {
        const res = await fetch("/api/roblox/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.assetId) {
          updatedIds[face] = data.assetId;
          setRobloxIds({ ...updatedIds });
        }
      } catch (err) {
        console.error(`Error upload ${face}:`, err);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
  };

  const handleZipDownload = async () => {
    const targetFaces = slicedFaces || (stitchImages.ft ? stitchImages : null);
    if (!targetFaces) return;

    const zip = new JSZip();
    const folder = zip.folder("crest-skybox");
    Object.entries(targetFaces).forEach(([key, dataUrl]) => {
      if (dataUrl) {
        const base64 = dataUrl.split(",")[1];
        folder?.file(`Skybox${key.toUpperCase()}.png`, base64, { base64: true });
      }
    });

    const luaTemplate = `-- Generated by CrestTools V10\nlocal sky = Instance.new("Sky")\nsky.Name = "CustomSky"\nsky.SkyboxBk = "rbxassetid://${robloxIds.bk || "YOUR_BK_ID"}"\nsky.SkyboxFt = "rbxassetid://${robloxIds.ft || "YOUR_FT_ID"}"\nsky.SkyboxLf = "rbxassetid://${robloxIds.lf || "YOUR_LF_ID"}"\nsky.SkyboxRt = "rbxassetid://${robloxIds.rt || "YOUR_RT_ID"}"\nsky.SkyboxUp = "rbxassetid://${robloxIds.up || "YOUR_UP_ID"}"\nsky.SkyboxDn = "rbxassetid://${robloxIds.dn || "YOUR_DN_ID"}"\nsky.Parent = game.Lighting\n`;
    folder?.file("SkyboxScript.lua", luaTemplate);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crest-skybox-v10-${Date.now()}.zip`;
    a.click();
  };

  const generatedLua = `local sky = Instance.new("Sky")
sky.Name = "CustomSky"
sky.SkyboxBk = "rbxassetid://${robloxIds.bk || "YOUR_BK_ID"}"
sky.SkyboxFt = "rbxassetid://${robloxIds.ft || "YOUR_FT_ID"}"
sky.SkyboxLf = "rbxassetid://${robloxIds.lf || "YOUR_LF_ID"}"
sky.SkyboxRt = "rbxassetid://${robloxIds.rt || "YOUR_RT_ID"}"
sky.SkyboxUp = "rbxassetid://${robloxIds.up || "YOUR_UP_ID"}"
sky.SkyboxDn = "rbxassetid://${robloxIds.dn || "YOUR_DN_ID"}"
sky.SunTextureId = "rbxassetid://${robloxIds.ft || "0"}"
sky.Parent = game.Lighting`;

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
                      r.onload = (ev) => processEquirectangularImage(ev.target?.result as string);
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
                    Geser slider untuk memindahkan posisi jahitan ke sudut lain.
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
                  <Skybox360Viewer 
                    slicedFaces={slicedFaces} 
                    panoramaUrl={panoramaUrl} 
                    autoRotate={autoRotate} 
                    containerId="viewer-full" 
                  />
                </div>
              </div>
            </div>

            {/* HASIL 6 SISI */}
            <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <span className="text-xs font-mono text-slate-400">3. HASIL 6 SISI + EXPORT CLOUD</span>

                {slicedFaces && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleAutoUpload}
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

              {slicedFaces ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  {(
                    [
                      { key: "up", label: "SkyboxUp" },
                      { key: "dn", label: "SkyboxDn" },
                      { key: "lf", label: "SkyboxLf" },
                      { key: "rt", label: "SkyboxRt" },
                      { key: "ft", label: "SkyboxFt" },
                      { key: "bk", label: "SkyboxBk" },
                    ] as const
                  ).map((f) => (
                    <div key={f.key} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-800 mb-2">
                        <img src={slicedFaces[f.key]} alt={f.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="block text-center text-xs font-mono font-bold mb-2">{f.label}</span>
                      <button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = slicedFaces[f.key];
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
          </>
        )}

        {/* TAB 2: GABUNG 6 SISI */}
        {activeTab === "stitch" && (
          <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold font-mono text-slate-300 mb-4">Upload 6 Sisi Terpisah</h3>
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
                        r.onload = (ev) => setStitchImages({ ...stitchImages, [face]: ev.target?.result as string });
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
                onClick={handleAutoUpload}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <CloudUpload className="w-4 h-4" /> Auto Upload 6 Sisi ke Roblox
              </button>
              <button onClick={handleZipDownload} className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
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
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{p.category}</span>
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
                        {copiedPromptId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedPromptId === p.id ? "Tersalin" : "Copy Prompt"}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("convert");
                          processEquirectangularImage(p.previewUrl);
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

        {/* LUA SCRIPT GENERATOR BOX */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Roblox Luau Script Generator (Auto-Filled)
            </h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLua);
                setCopiedLua(true);
                setTimeout(() => setCopiedLua(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs flex items-center gap-1 transition-colors"
            >
              {copiedLua ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copiedLua ? "Tersalin" : "Salin Script"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {(Object.keys(robloxIds) as SkyboxFace[]).map((k) => (
              <div key={k}>
                <label className="text-[10px] font-mono text-slate-500">{k.toUpperCase()} ID</label>
                <input
                  value={robloxIds[k]}
                  onChange={(e) => setRobloxIds({ ...robloxIds, [k]: e.target.value })}
                  placeholder={`ID untuk ${k}`}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[#080b11] border border-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            ))}
          </div>
          <pre className="text-[12px] font-mono bg-[#080b11] p-4 rounded-xl border border-slate-800 overflow-x-auto text-slate-300">
            {generatedLua}
          </pre>
        </div>
      </main>
    </div>
  );
}
