// ============================================================
// Crest Tools - Skybox Converter (v4)
// Equirectangular 2:1  ->  6 face skybox
//
// Frame dunia converter: +Y atas, +X kanan, -Z depan
// Yaw 0 => titik tengah panorama (u = 0.5) jadi arah DEPAN (-Z)
// Seam panorama (u = 0 / 1) jatuh di arah BELAKANG (+Z)
//
// ALUR:
//   1. convertEquirectToSkybox()  -> face "ideal" (dipakai preview)
//   2. applyFaceConfig()          -> face "export" (sudah disesuaikan ke slot Roblox,
//                                    dipakai ZIP + upload). Lossless, tanpa sampling ulang.
// ============================================================

export type SkyboxFace = "up" | "dn" | "lf" | "rt" | "ft" | "bk";

export const ALL_FACES: SkyboxFace[] = ["ft", "bk", "lf", "rt", "up", "dn"];

export interface FaceConfig {
  /** Gambar dari arah converter mana yang dipakai untuk SLOT Roblox ini. */
  source: SkyboxFace;
  /** Rotasi gambar searah jarum jam (derajat), dilakukan SETELAH flip. */
  rotate: 0 | 90 | 180 | 270;
  flipX: boolean;
  flipY: boolean;
}

/** Tanpa koreksi sama sekali (slot = arah converter). */
export const NEUTRAL_FACE_CONFIG: Record<SkyboxFace, FaceConfig> = {
  ft: { source: "ft", rotate: 0, flipX: false, flipY: false },
  bk: { source: "bk", rotate: 0, flipX: false, flipY: false },
  lf: { source: "lf", rotate: 0, flipX: false, flipY: false },
  rt: { source: "rt", rotate: 0, flipX: false, flipY: false },
  up: { source: "up", rotate: 0, flipX: false, flipY: false },
  dn: { source: "dn", rotate: 0, flipX: false, flipY: false },
};

/**
 * DEFAULT = hasil tes langsung di Roblox Studio:
 *   slot Bk <- gambar lf   |  slot Lf <- gambar bk
 *   slot Rt <- gambar ft   |  slot Ft <- gambar rt
 *   Up & Dn tetap.
 * Jadi ID yang di-upload sudah masuk slot yang benar, ga perlu tuker manual.
 */
export const DEFAULT_FACE_CONFIG: Record<SkyboxFace, FaceConfig> = {
  ft: { source: "rt", rotate: 0, flipX: false, flipY: false },
  bk: { source: "lf", rotate: 0, flipX: false, flipY: false },
  lf: { source: "bk", rotate: 0, flipX: false, flipY: false },
  rt: { source: "ft", rotate: 0, flipX: false, flipY: false },
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
// 2. Terapin penyesuaian slot Roblox (swap / rotate / flip)
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
      out[face] = faces[cfg.source];
      continue;
    }

    ctx.imageSmoothingEnabled = false;
    // Urutan: flip dulu, lalu putar searah jarum jam
    ctx.translate(size / 2, size / 2);
    ctx.rotate((cfg.rotate * Math.PI) / 180);
    ctx.scale(cfg.flipX ? -1 : 1, cfg.flipY ? -1 : 1);
    ctx.drawImage(img, -size / 2, -size / 2);

    out[face] = canvas.toDataURL("image/png");
  }

  return out as Record<SkyboxFace, string>;
};
