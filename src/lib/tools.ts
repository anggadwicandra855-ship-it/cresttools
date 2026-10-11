// Sumber tunggal daftar tools CrestTools.
// Navbar (dropdown), halaman Beranda, dan katalog /tools semuanya baca dari sini.
// Nambah tool baru = cukup tambah satu objek di TOOLS.

import {
  Calculator,
  Palette,
  Code2,
  Box,
  Image as ImageIcon,
  Music,
  Sliders,
  Bot,
  RefreshCw,
  Film,
  UserSearch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "Image" | "Audio" | "Scripting" | "Animation" | "Utility";
export type ToolStatus = "live" | "soon";

export interface ToolItem {
  id: string;
  title: string;
  /** Deskripsi singkat (dropdown navbar). */
  short: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  /** Rute tool. Wajib diisi kalau status "live". */
  href: string;
  status: ToolStatus;
}

export const TOOLS: ToolItem[] = [
  {
    id: "skybox-converter",
    title: "Skybox Converter 3D",
    short: "Panorama 360° ke 6 sisi Skybox",
    description:
      "Konversi gambar panorama 360 derajat menjadi 6 sisi tekstur Skybox lengkap dengan preview 3D, ZIP, dan upload ke Roblox.",
    category: "Image",
    icon: ImageIcon,
    href: "/tools/skybox-converter",
    status: "live",
  },
  {
    id: "robux-tax",
    title: "Robux Tax Calculator",
    short: "Hitung potongan 30% Robux",
    description: "Perhitungan otomatis potongan pajak 30% untuk DevProduct dan Gamepass secara akurat.",
    category: "Utility",
    icon: Calculator,
    href: "/tools/robux-calculator",
    status: "live",
  },
  {
    id: "lua-cleaner",
    title: "Lua Cleaner & Formatter",
    short: "Rapikan script Luau",
    description: "Pembersihan dan pemformatan struktur script Luau agar lebih terstruktur dan mudah dibaca.",
    category: "Scripting",
    icon: Code2,
    href: "/tools/lua-formatter",
    status: "live",
  },
  {
    id: "color-palette",
    title: "Color Palette & Color3",
    short: "Palet warna ke Color3.fromRGB",
    description: "Generator skema warna estetika dengan konversi otomatis ke format Color3.fromRGB.",
    category: "Image",
    icon: Palette,
    href: "/tools/color-palette",
    status: "live",
  },
  {
    id: "image-upscaler",
    title: "AI Image Upscaler & Sharpener",
    short: "Pertajam gambar 2x sampai 4x",
    description: "Perjelas tekstur, decal, dan gambar panorama Roblox 2x hingga 4x lebih tajam tanpa pecah.",
    category: "Image",
    icon: Sparkles,
    href: "/tools/image-upscaler",
    status: "live",
  },
  {
    id: "roblox-lookup",
    title: "Roblox User & Group Lookup",
    short: "Cari akun, aset, dan grup",
    description: "Pencarian informasi detail akun, kepemilikan aset, dan ID grup secara instan.",
    category: "Utility",
    icon: UserSearch,
    href: "/tools/roblox-lookup",
    status: "live",
  },

  // ---------- Segera hadir ----------
  {
    id: "gui-builder-ai",
    title: "GUI Builder AI & Preview",
    short: "Generator antarmuka Roblox",
    description: "Generator antarmuka Roblox otomatis berbasis AI dengan ekspor ke LocalScript.",
    category: "Utility",
    icon: Bot,
    href: "",
    status: "soon",
  },
  {
    id: "sprite-sheet-maker",
    title: "Sprite Sheet Maker",
    short: "Gabung frame jadi sprite sheet",
    description: "Penggabungan beberapa frame animasi menjadi satu file sprite sheet terkompresi.",
    category: "Image",
    icon: Box,
    href: "",
    status: "soon",
  },
  {
    id: "material-generator",
    title: "Material Generator",
    short: "Peta tekstur PBR",
    description: "Pembuatan peta tekstur PBR (Normal, Roughness) untuk MaterialService.",
    category: "Image",
    icon: Sparkles,
    href: "",
    status: "soon",
  },
  {
    id: "script-sync",
    title: "Script Sync Studio",
    short: "Sinkronisasi kode ke Studio",
    description: "Jembatan sinkronisasi kode dari browser langsung ke Roblox Studio.",
    category: "Scripting",
    icon: RefreshCw,
    href: "",
    status: "soon",
  },
  {
    id: "roblox-audio-approved",
    title: "Roblox Music Approved",
    short: "Audio sesuai standar Roblox",
    description: "Pemrosesan audio agar sesuai dengan standar durasi dan hak cipta Roblox.",
    category: "Audio",
    icon: Music,
    href: "",
    status: "soon",
  },
  {
    id: "audio-alter",
    title: "Audio Alter & Pitcher",
    short: "Ubah pitch, kecepatan, volume",
    description: "Modifikasi pitch, kecepatan, dan volume untuk efek suara (SFX) Roblox.",
    category: "Audio",
    icon: Sliders,
    href: "",
    status: "soon",
  },
  {
    id: "anim-maker",
    title: "Animation Maker & Smoother",
    short: "Editor keyframe sederhana",
    description: "Editor keyframe sederhana dan penghalus kurva animasi Roblox.",
    category: "Animation",
    icon: Film,
    href: "",
    status: "soon",
  },
];

export const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");
export const SOON_TOOLS = TOOLS.filter((t) => t.status === "soon");

export const TOOL_CATEGORIES: ("All" | ToolCategory)[] = [
  "All",
  "Image",
  "Scripting",
  "Audio",
  "Animation",
  "Utility",
];
