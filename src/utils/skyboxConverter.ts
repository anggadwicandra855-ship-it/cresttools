// ============================================================
// Crest Tools - Skybox Converter (v3)
// Equirectangular 2:1  ->  6 face skybox
//
// Frame dunia (Roblox): +Y atas, +X kanan, -Z depan
// Yaw 0 => titik tengah panorama (u = 0.5) jadi arah DEPAN (-Z)
// Seam panorama (u = 0 / 1) jatuh di arah BELAKANG (+Z)
//
// ALUR:
//   1. convertEquirectToSkybox()  -> face "ideal" (tanpa koreksi, dipakai preview)
//   2. applyFaceConfig()          -> face "export" (sudah dikoreksi buat Roblox,
//                                    dipakai ZIP + upload). Murah, tanpa sampling ulang.
// ============================================================

export type SkyboxFace = "up" | "dn" | "lf" | "rt" | "ft" | "bk";

export const ALL_FACES: SkyboxFace[] = ["ft", "bk", "lf", "rt", "up", "dn"];

export interface FaceConfig {
  /** Gambar dari arah dunia mana yang dipakai untuk slot face ini. Tuker Lf/Rt = tuker `source`. */
  source: SkyboxFace;
  /** Rotasi gambar searah jarum jam (derajat), dilakukan SETELAH flip. */
  rotate: 0 | 90 | 180 | 270;
  flipX: boolean;
  flipY: boolean;
}

/**
 * ============ TABEL KOREKSI PER FACE ============
 * Default = tanpa koreksi. Kalibrasi lewat panel di halaman, atau ubah di sini.
 */
export const DEFAULT_FACE_CONFIG: Record<SkyboxFace, FaceConfig> = {
  ft: { source: "ft", rotate: 0, flipX: false, flipY: false },
  bk: { source: "bk", rotate: 0, flipX: false, flipY: false },
  lf: { source: "lf", rotate: 0, flipX: false, flipY: false },
  rt: { source: "rt", rotate: 0, flipX: false, flipY: false },
  up: { source: "up", rotate: 0, flipX: false, flipY: false },
  dn: { source: "dn", rotate: 0, flipX: false, flipY: false },
};

// nx: -1..1 ke kanan, ny: -1..1 ke bawah (koordinat gambar face).
// Semua face dilihat dari DALAM kubus, tanpa mirror.
//
//  ft : lihat -Z, kanan = +X
//  rt : lihat +X, kanan = +Z
//  bk : lihat +Z, kanan = -X
//  lf : lihat -X, kanan = -Z
//  up : lihat +Y, kanan = +X, SISI ATAS gambar = belakang (+Z)
//  dn : lihat -Y, kanan = +X, SISI ATAS gambar = depan (-Z)
const faceDirection = (
  face: SkyboxFace,
  nx: number,
  ny: number
): [number, number, number] => {
  switch (face) {
    case "ft": return [nx, -ny, -1];
    case "rt": return [1, -ny, nx];
    case "bk": return [-nx, -ny, 1];
    case "lf": return [-1, -ny, -nx];
    case "up": return [nx, 1, -ny];
    case "dn": return [nx, -1, ny];
  }
};

const mod = (a: number, n: number) => ((a % n) + n) % n;
const nextFrame = () => new Promise<void>((r) => setTimeout(r, 0));

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });

// ------------------------------------------------------------
// 1. Equirect -> 6 face ideal
// ------------------------------------------------------------
export const convertEquirectToSkybox = async (
  src: string,
  faceSize: number = 1024,
  yawDeg: number = 0
): Promise<Record<SkyboxFace, string>> => {
  const img = await loadImage(src);

  const panoCanvas = document.createElement("canvas");
  panoCanvas.width = img.width;
  panoCanvas.height = img.height;
  const panoCtx = panoCanvas.getContext("2d", { willReadFrequently: true });
  if (!panoCtx) throw new Error("Gagal membuat canvas context");

  panoCtx.drawImage(img, 0, 0);
  const srcData = panoCtx.getImageData(0, 0, img.width, img.height).data;
  const srcW = img.width;
  const srcH = img.height;
  const yawRad = (yawDeg * Math.PI) / 180;

  const results: Partial<Record<SkyboxFace, string>> = {};

  for (const face of ALL_FACES) {
    const canvas = document.createElement("canvas");
    canvas.width = faceSize;
    canvas.height = faceSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const imgData = ctx.createImageData(faceSize, faceSize);

    for (let y = 0; y < faceSize; y++) {
      for (let x = 0; x < faceSize; x++) {
        const nx = ((x + 0.5) / faceSize) * 2 - 1;
        const ny = ((y + 0.5) / faceSize) * 2 - 1;

        let [vx, vy, vz] = faceDirection(face, nx, ny);
        const r = Math.sqrt(vx * vx + vy * vy + vz * vz);
        vx /= r; vy /= r; vz /= r;

        // phi = 0 di depan (-Z), +90 di kanan (+X)
        const phi = Math.atan2(vx, -vz) + yawRad;
        const theta = Math.asin(Math.max(-1, Math.min(1, vy)));

        // WRAP horizontal (bukan clamp)
        const u = mod(phi / (2 * Math.PI) + 0.5, 1);
        const v = (Math.PI / 2 - theta) / Math.PI; // 0 = atas, 1 = bawah

        const px = u * srcW - 0.5;
        const py = Math.max(0, Math.min(v * srcH - 0.5, srcH - 1));

        const x0f = Math.floor(px);
        const fx = px - x0f;
        const x0 = mod(x0f, srcW);
        const x1 = mod(x0f + 1, srcW);

        const y0 = Math.floor(py);
        const y1 = Math.min(y0 + 1, srcH - 1);
        const fy = py - y0;

        const i00 = (y0 * srcW + x0) * 4;
        const i10 = (y0 * srcW + x1) * 4;
        const i01 = (y1 * srcW + x0) * 4;
        const i11 = (y1 * srcW + x1) * 4;
        const d = (y * faceSize + x) * 4;

        for (let c = 0; c < 4; c++) {
          imgData.data[d + c] =
            srcData[i00 + c] * (1 - fx) * (1 - fy) +
            srcData[i10 + c] * fx * (1 - fy) +
            srcData[i01 + c] * (1 - fx) * fy +
            srcData[i11 + c] * fx * fy;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    results[face] = canvas.toDataURL("image/png");
    await nextFrame(); // biar UI ga freeze
  }

  return results as Record<SkyboxFace, string>;
};

// ------------------------------------------------------------
// 2. Terapin koreksi Roblox (swap / rotate / flip) ke face ideal
//    Lossless, tanpa sampling ulang -> cepat dipakai buat kalibrasi.
// ------------------------------------------------------------
const isIdentity = (face: SkyboxFace, cfg: FaceConfig) =>
  cfg.source === face && cfg.rotate === 0 && !cfg.flipX && !cfg.flipY;

export const applyFaceConfig = async (
  faces: Record<SkyboxFace, string>,
  config: Record<SkyboxFace, FaceConfig> = DEFAULT_FACE_CONFIG
): Promise<Record<SkyboxFace, string>> => {
  const out: Partial<Record<SkyboxFace, string>> = {};

  for (const face of ALL_FACES) {
    const cfg = config[face];

    if (isIdentity(face, cfg)) {
      out[face] = faces[face];
      continue;
    }

    const img = await loadImage(faces[cfg.source]);
    const size = img.width;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      out[face] = faces[face];
      continue;
    }

    ctx.imageSmoothingEnabled = false;
    // Urutan: gambar di-flip dulu, lalu diputar searah jarum jam
    ctx.translate(size / 2, size / 2);
    ctx.rotate((cfg.rotate * Math.PI) / 180);
    ctx.scale(cfg.flipX ? -1 : 1, cfg.flipY ? -1 : 1);
    ctx.drawImage(img, -size / 2, -size / 2);

    out[face] = canvas.toDataURL("image/png");
  }

  return out as Record<SkyboxFace, string>;
};

// ------------------------------------------------------------
// 3. GAMBAR TES berlabel buat kalibrasi di Roblox Studio
// ------------------------------------------------------------
export const generateTestPanorama = (width: number = 4096): string => {
  const W = width;
  const H = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Sektor warna per 90 derajat (jadi pie slice juga di kutub atas/bawah)
  const sectors = [
    { color: "#e53935", u0: 0.375, u1: 0.625 }, // FRONT merah
    { color: "#43a047", u0: 0.625, u1: 0.875 }, // RIGHT hijau
    { color: "#fdd835", u0: 0.125, u1: 0.375 }, // LEFT kuning
    { color: "#1e88e5", u0: 0.875, u1: 1.125 }, // BACK biru (nyebrang seam)
  ];
  for (const s of sectors) {
    ctx.fillStyle = s.color;
    ctx.fillRect(s.u0 * W, 0, (s.u1 - s.u0) * W, H);
    if (s.u1 > 1) ctx.fillRect((s.u0 - 1) * W, 0, (s.u1 - s.u0) * W, H);
  }

  // Grid longitude tiap 15 derajat (tebel tiap 45)
  for (let deg = 0; deg <= 360; deg += 15) {
    const x = (deg / 360) * W;
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = deg % 45 === 0 ? 6 : 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  // Grid latitude tiap 15 derajat
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = (0.5 - lat / 180) * H;
    ctx.strokeStyle = lat === 0 ? "#000" : "rgba(0,0,0,0.35)";
    ctx.lineWidth = lat === 0 ? 8 : 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Meridian DEPAN (u = 0.5): garis putih tebel, kelihatan juga di kutub
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0.5 * W, 0);
  ctx.lineTo(0.5 * W, H);
  ctx.stroke();

  // Seam BELAKANG (u = 0 / 1): garis hitam
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(3, 0); ctx.lineTo(3, H);
  ctx.moveTo(W - 3, 0); ctx.lineTo(W - 3, H);
  ctx.stroke();

  // Label + huruf "F" (nunjukin mirror/kebalik)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labels = [
    { t: "FRONT -Z", u: 0.5 },
    { t: "RIGHT +X", u: 0.75 },
    { t: "LEFT -X", u: 0.25 },
    { t: "BACK +Z", u: 0.0 },
    { t: "BACK +Z", u: 1.0 },
  ];
  for (const c of labels) {
    const x = c.u * W;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(H * 0.12)}px sans-serif`;
    ctx.strokeText(c.t, x, H * 0.5 - H * 0.12);
    ctx.fillText(c.t, x, H * 0.5 - H * 0.12);
    ctx.font = `bold ${Math.round(H * 0.2)}px sans-serif`;
    ctx.strokeText("F", x, H * 0.5 + H * 0.12);
    ctx.fillText("F", x, H * 0.5 + H * 0.12);
  }

  // Penanda kutub
  ctx.font = `bold ${Math.round(H * 0.07)}px sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 8;
  for (let i = 0; i < 4; i++) {
    const x = (i + 0.5) * (W / 4);
    ctx.strokeText("UP", x, H * 0.04);
    ctx.fillText("UP", x, H * 0.04);
    ctx.strokeText("DOWN", x, H * 0.96);
    ctx.fillText("DOWN", x, H * 0.96);
  }

  return canvas.toDataURL("image/png");
};
