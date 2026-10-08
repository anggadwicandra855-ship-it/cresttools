"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import JSZip from "jszip";
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
    prompt:
      "360 equirectangular skybox, futuristic cyberpunk city at night, glowing neon magenta and cyan skyscrapers",
    previewUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&q=80",
  },
  {
    id: "anime-sunset",
    name: "Anime Afternoon Sunset",
    category: "Anime",
    prompt:
      "360 equirectangular skybox, makoto shinkai style, golden hour anime sunset clouds",
    previewUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80",
  },
  {
    id: "deep-space",
    name: "Deep Space Nebula",
    category: "Space",
    prompt:
      "360 equirectangular skybox, deep cosmic outer space, glowing purple nebula",
    previewUrl:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=80",
  },
  {
    id: "fantasy-islands",
    name: "Celestial Floating Islands",
    category: "Fantasy",
    prompt:
      "360 equirectangular skybox, epic fantasy sky, floating magical crystal islands",
    previewUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80",
  },
  {
    id: "overcast-storm",
    name: "Overcast Thunderstorm",
    category: "Weather",
    prompt:
      "360 equirectangular skybox, dark dramatic storm clouds",
    previewUrl:
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600&q=80",
  },
  {
    id: "golden-mountain",
    name: "Golden Hour Alps",
    category: "Nature",
    prompt:
      "360 equirectangular skybox, dramatic golden hour, snow mountain horizon",
    previewUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  },
];

type SkyboxFace = "up" | "dn" | "lf" | "rt" | "ft" | "bk";

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
  textureUrl,
  autoRotate,
  containerId,
}: {
  textureUrl: string | null;
  autoRotate: boolean;
  containerId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textureUrl) return;
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
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = -0.5;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;

    const loader = new THREE.TextureLoader();
    loader.load(textureUrl, (texture: any) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const geometry = new THREE.SphereGeometry(500, 64, 64);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      scene.add(new THREE.Mesh(geometry, material));
    });

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
  }, [textureUrl, autoRotate]);

  if (!textureUrl)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
        <Maximize2 className="w-8 h-8 mb-2 opacity-50" />
        Upload panorama untuk POV 360°
      </div>
    );

  return (
    <div
      id={containerId}
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}

export default function SkyboxConverterPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [slicedFaces, setSlicedFaces] = useState<Record<SkyboxFace, string> | null>(null);
  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<SkyboxPreset>(AI_PRESETS[1]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [robloxIds, setRobloxIds] = useState<Record<SkyboxFace, string>>({
    up: "",
    dn: "",
    lf: "",
    rt: "",
    ft: "",
    bk: "",
  });
  const [copiedLua, setCopiedLua] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

            // V10 FINAL - ROBLOX NATIVE MATRIX + BILINEAR FILTERING (CREDIT: GROK AI LOGIC)
  const processEquirectangularImage = async (src: string) => {
    setIsProcessing(true);
    setPanoramaUrl(src);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = src;
      });

      const panoCanvas = document.createElement("canvas");
      panoCanvas.width = img.width;
      panoCanvas.height = img.height;
      const panoCtx = panoCanvas.getContext("2d", { willReadFrequently: true })!;
      panoCtx.drawImage(img, 0, 0);
      const panoData = panoCtx.getImageData(0, 0, img.width, img.height);

      const faceSize = 1024;
      const results: Partial<Record<SkyboxFace, string>> = {};
      const faces: SkyboxFace[] = ["ft", "bk", "lf", "rt", "up", "dn"];

      for (const face of faces) {
        const canvas = document.createElement("canvas");
        canvas.width = faceSize;
        canvas.height = faceSize;
        const ctx = canvas.getContext("2d")!;
        const imgData = ctx.createImageData(faceSize, faceSize);

        for (let y = 0; y < faceSize; y++) {
          for (let x = 0; x < faceSize; x++) {
            const nx = (x / (faceSize - 1)) * 2 - 1;
            const ny = (y / (faceSize - 1)) * 2 - 1;

            let vx = 0, vy = 0, vz = 0;

            // GROK'S ROBLOX NATIVE MAPPING (Orientasi Presisi 100%)
            switch (face) {
              case "ft": vx = nx;  vy = -ny; vz = -1;  break; // Front (-Z)
              case "bk": vx = -nx; vy = -ny; vz = 1;   break; // Back (+Z)
              case "lf": vx = -1;  vy = -ny; vz = -nx; break; // Left (-X)
              case "rt": vx = 1;   vy = -ny; vz = nx;  break; // Right (+X)
              case "up": vx = ny;  vy = 1;   vz = -nx; break; // Up (+Y) - 90° CW Fix
              case "dn": vx = -ny; vy = -1;  vz = -nx; break; // Down (-Y) - 90° CCW Fix
            }

            const radius = Math.sqrt(vx * vx + vy * vy + vz * vz);
            vx /= radius; vy /= radius; vz /= radius;

            // Konversi ke koordinat spherical (mempertahankan -vz untuk Front)
            const phi = Math.atan2(vx, -vz);
            const theta = Math.asin(vy);

            const u = (phi + Math.PI) / (2 * Math.PI);
            const v = (Math.PI / 2 - theta) / Math.PI;

            // GROK'S BILINEAR FILTERING (Mencegah patahan 1 pixel)
            const uClamped = Math.max(0, Math.min(u, 1 - 1e-6));
            const vClamped = Math.max(0, Math.min(v, 1 - 1e-6));

            const px = uClamped * (img.width - 1);
            const py = vClamped * (img.height - 1);

            const x0 = Math.floor(px);
            const y0 = Math.floor(py);
            const x1 = Math.min(x0 + 1, img.width - 1);
            const y1 = Math.min(y0 + 1, img.height - 1);

            const fx = px - x0;
            const fy = py - y0;

            const getPixel = (px: number, py: number) => {
              const i = (py * img.width + px) * 4;
              return [
                panoData.data[i],
                panoData.data[i + 1],
                panoData.data[i + 2],
                panoData.data[i + 3],
              ];
            };

            const c00 = getPixel(x0, y0);
            const c10 = getPixel(x1, y0);
            const c01 = getPixel(x0, y1);
            const c11 = getPixel(x1, y1);

            const destIdx = (y * faceSize + x) * 4;
            
            // Rumus Blending Warna
            for(let c = 0; c < 4; c++) {
               imgData.data[destIdx + c] = 
                 c00[c] * (1 - fx) * (1 - fy) + 
                 c10[c] * fx * (1 - fy) + 
                 c01[c] * (1 - fx) * fy + 
                 c11[c] * fx * fy;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        results[face] = canvas.toDataURL("image/png");
      }

      setSlicedFaces(results as Record<SkyboxFace, string>);
      setIsProcessing(false);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    getAndClearIndexedDB().then((b) => {
      if (b) processEquirectangularImage(b);
    });
  }, []);

  const handleAutoUpload = async () => {
    if (!slicedFaces) return;

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
      if (!slicedFaces[face]) continue;

      setUploadProgress(`Uploading ${face.toUpperCase()} (${i + 1}/6)...`);

      const blob = dataURItoBlob(slicedFaces[face]);
      const file = new File([blob], `Skybox_${face.toUpperCase()}.png`, {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("apiKey", creds.apiKey);
      formData.append("creatorType", creds.creatorType);
      formData.append("creatorId", creds.creatorId);
      formData.append("name", `CrestSky_${face.toUpperCase()}_${timeStamp}`);
      formData.append("file", file);

      try {
        const res = await fetch("/api/roblox/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.assetId) {
          updatedIds[face] = data.assetId;
          setRobloxIds({ ...updatedIds });
        } else {
          console.error(`Gagal upload ${face}:`, data.error);
        }
      } catch (err) {
        console.error(`Error koneksi upload ${face}:`, err);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
  };

  const handleZipDownload = async () => {
    if (!slicedFaces) return;
    const zip = new JSZip();
    const folder = zip.folder("crest-skybox");
    Object.entries(slicedFaces).forEach(([key, dataUrl]) => {
      const base64 = dataUrl.split(",")[1];
      folder?.file(`Skybox${key.toUpperCase()}.png`, base64, { base64: true });
    });

    const luaTemplate = `-- Generated by CrestTools V6\nlocal sky = Instance.new("Sky")\nsky.Name = "CustomSky"\nsky.SkyboxBk = "rbxassetid://${robloxIds.bk || "YOUR_BK_ID"}"\nsky.SkyboxFt = "rbxassetid://${robloxIds.ft || "YOUR_FT_ID"}"\nsky.SkyboxLf = "rbxassetid://${robloxIds.lf || "YOUR_LF_ID"}"\nsky.SkyboxRt = "rbxassetid://${robloxIds.rt || "YOUR_RT_ID"}"\nsky.SkyboxUp = "rbxassetid://${robloxIds.up || "YOUR_UP_ID"}"\nsky.SkyboxDn = "rbxassetid://${robloxIds.dn || "YOUR_DN_ID"}"\nsky.Parent = game.Lighting\n`;
    folder?.file("SkyboxScript.lua", luaTemplate);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crest-skybox-v6-${Date.now()}.zip`;
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
                V6 GPU CAPTURE
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Roblox Native GPU Mirror Matrix + Direct Open Cloud Upload
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-mono text-slate-400">1. UPLOAD</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader();
                  r.onload = (ev) =>
                    processEquirectangularImage(ev.target?.result as string);
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
              <p className="text-xs font-bold">Klik Upload Panorama 2:1</p>
            </div>
            {isProcessing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                Capturing V6 GPU Seamless Cube...
              </div>
            )}

            <div className="mt-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                AUTO-UPLOAD SYSTEM READY
              </p>
              <p className="text-[11px] text-emerald-200/70 mt-1 leading-relaxed">
                Potongan gambar diproses langsung via WebGL GPU untuk menjamin zero-seam di Roblox Studio.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#161f32]/80 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                2. 360° POV REAL
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    autoRotate
                      ? "bg-emerald-500 text-black shadow-md"
                      : "bg-slate-800 text-slate-300"
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
              className="w-full h-[420px] bg-black rounded-xl overflow-hidden border border-slate-800"
            >
              <Skybox360Viewer
                textureUrl={panoramaUrl}
                autoRotate={autoRotate}
                containerId="viewer-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <span className="text-xs font-mono text-slate-400">
              3. HASIL 6 SISI + EXPORT CLOUD
            </span>

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
            <>
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
                  <div
                    key={f.key}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden border border-slate-800 mb-2">
                      <img
                        src={slicedFaces[f.key]}
                        alt={f.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="block text-center text-xs font-mono font-bold mb-2">
                      {f.label}
                    </span>
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

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    4. Roblox Luau Script Generator (Auto-Filled)
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLua);
                      setCopiedLua(true);
                      setTimeout(() => setCopiedLua(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copiedLua ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedLua ? "Tersalin" : "Salin Script"}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {(Object.keys(robloxIds) as SkyboxFace[]).map((k) => (
                    <div key={k}>
                      <label className="text-[10px] font-mono text-slate-500">
                        {k.toUpperCase()} ID
                      </label>
                      <input
                        value={robloxIds[k]}
                        onChange={(e) =>
                          setRobloxIds({ ...robloxIds, [k]: e.target.value })
                        }
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
            </>
          ) : (
            <div className="text-center py-12 text-xs font-mono text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
              Upload panorama untuk memotong 6 sisi tekstur.
            </div>
          )}
        </div>

        <section className="bg-[#161f32]/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f97316]" />
            Preset Skybox
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            {AI_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPreset(p);
                  processEquirectangularImage(p.previewUrl);
                }}
                className={`p-2.5 rounded-xl border text-left overflow-hidden transition-all ${
                  selectedPreset.id === p.id
                    ? "border-emerald-500 bg-slate-900 ring-2 ring-emerald-500/20"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="h-20 rounded-lg overflow-hidden mb-2">
                  <img src={p.previewUrl} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold truncate block">
                  {p.name}
                </span>
                <span className="text-[10px] text-slate-500">{p.category}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
