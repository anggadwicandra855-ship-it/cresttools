// ============================================================
// Crest Tools - Skybox Converter (v2)
// Equirectangular 2:1  ->  6 face skybox Roblox
//
// Frame dunia (Roblox): +Y atas, +X kanan, -Z depan (arah kamera default)
// Yaw 0 => titik tengah panorama (u = 0.5) jadi arah DEPAN (-Z)
// Seam panorama (u = 0 / 1) jatuh di arah BELAKANG (+Z)
// ============================================================

export type SkyboxFace = "up" | "dn" | "lf" | "rt" | "ft" | "bk";

export interface FaceConfig {
  /** Arah dunia mana yang dijahit ke face ini. Mau tuker Lf/Rt? Tuker `source`-nya. */
  source: SkyboxFace;
  /** Rotasi gambar face searah jarum jam (derajat). */
  rotate: 0 | 90 | 180 | 270;
  /** Mirror horizontal / vertikal (dipakai kalau hasil di Studio kebalik/mirror). */
  flipX: boolean;
  flipY: boolean;
}

/**
 * ============ TABEL ORIENTASI PER FACE ============
 * Ini satu-satunya tempat yang perlu lu ubah buat nyesuain ke Roblox.
 * Urutan koreksi:
 *   1. Lf/Rt ketuker?       -> tuker `source` antara "lf" dan "rt"
 *   2. Up/Dn muter?         -> ganti `rotate` (90 / 180 / 270)
 *   3. Up/Dn mirror?        -> aktifin flipX atau flipY
 */
export const DEFAULT_FACE_CONFIG: Record<SkyboxFace, FaceConfig> = {
  ft: { source: "ft", rotate: 0, flipX: false, flipY: false },
  bk: { source: "bk", rotate: 0, flipX: false, flipY: false },
  lf: { source: "lf", rotate: 0, flipX: false, flipY: false },
  rt: { source: "rt", rotate: 0, flipX: false, flipY: false },
  up: { source: "up", rotate: 0, flipX: false, flipY: false },
  dn: { source: "dn", rotate: 0, flipX: false, flipY: false },
};

// nx, ny: koordinat face -1..1 (nx ke kanan, ny ke bawah di gambar)
// Dilihat dari DALAM kubus, tanpa mirror.
const faceDirection = (
  face: SkyboxFace,
  nx: number,
  ny: number
): [number, number, number] => {
  switch (face) {
    case "ft": return [nx, -ny, -1]; // depan  (-Z)
    case "rt": return [1, -ny, nx];  // kanan  (+X)
    case "bk": return [-nx, -ny, 1]; // belakang (+Z)
    case "lf": return [-1, -ny, -nx]; // kiri   (-X)
    case "up": return [nx, 1, ny];   // atas   (sisi atas gambar -> depan)
    case "dn": return [nx, -1, ny];  // bawah  (sisi atas gambar -> depan)
  }
};

const applyOrientation = (
  nx: number,
  ny: number,
  cfg: FaceConfig
): [number, number] => {
  if (cfg.flipX) nx = -nx;
  if (cfg.flipY) ny = -ny;
  switch (cfg.rotate) {
    case 90: return [ny, -nx];
    case 180: return [-nx, -ny];
    case 270: return [-ny, nx];
    default: return [nx, ny];
  }
};

const mod = (a: number, n: number) => ((a % n) + n) % n;
const nextFrame = () => new Promise<void>((r) => setTimeout(r, 0));

export const convertEquirectToSkybox = async (
  src: string,
  faceSize: number = 1024,
  yawDeg: number = 0,
  config: Record<SkyboxFace, FaceConfig> = DEFAULT_FACE_CONFIG
): Promise<Record<SkyboxFace, string>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = (err) => reject(err);
    img.onload = async () => {
      try {
        const panoCanvas = document.createElement("canvas");
        panoCanvas.width = img.width;
        panoCanvas.height = img.height;
        const panoCtx = panoCanvas.getContext("2d", { willReadFrequently: true });
        if (!panoCtx) return reject("Gagal membuat canvas context");

        panoCtx.drawImage(img, 0, 0);
        const srcData = panoCtx.getImageData(0, 0, img.width, img.height).data;
        const srcW = img.width;
        const srcH = img.height;

        const results: Partial<Record<SkyboxFace, string>> = {};
        const faces: SkyboxFace[] = ["ft", "bk", "lf", "rt", "up", "dn"];
        const yawRad = (yawDeg * Math.PI) / 180;

        for (const face of faces) {
          const cfg = config[face];
          const canvas = document.createElement("canvas");
          canvas.width = faceSize;
          canvas.height = faceSize;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          const imgData = ctx.createImageData(faceSize, faceSize);

          for (let y = 0; y < faceSize; y++) {
            for (let x = 0; x < faceSize; x++) {
              const nx0 = ((x + 0.5) / faceSize) * 2 - 1;
              const ny0 = ((y + 0.5) / faceSize) * 2 - 1;

              const [nx, ny] = applyOrientation(nx0, ny0, cfg);
              let [vx, vy, vz] = faceDirection(cfg.source, nx, ny);

              const r = Math.sqrt(vx * vx + vy * vy + vz * vz);
              vx /= r; vy /= r; vz /= r;

              // phi = 0 di depan (-Z), +90 di kanan (+X)
              const phi = Math.atan2(vx, -vz) + yawRad;
              const theta = Math.asin(Math.max(-1, Math.min(1, vy)));

              // WRAP horizontal (bukan clamp) -> fix garis seam
              const u = mod(phi / (2 * Math.PI) + 0.5, 1);
              const v = (Math.PI / 2 - theta) / Math.PI; // 0 = atas, 1 = bawah

              // pusat piksel = +0.5, jadi koordinat sampling = u*W - 0.5
              const px = u * srcW - 0.5;
              const py = Math.max(0, Math.min(v * srcH - 0.5, srcH - 1));

              const x0f = Math.floor(px);
              const fx = px - x0f;
              const x0 = mod(x0f, srcW);
              const x1 = mod(x0f + 1, srcW); // wrap kanan -> kiri

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

        resolve(results as Record<SkyboxFace, string>);
      } catch (e) {
        reject(e);
      }
    };
    img.src = src;
  });
};

// ============================================================
// GAMBAR TES: panorama 2:1 berlabel buat kalibrasi di Roblox Studio
// Pakai sebagai input converter, download zip, test di Studio.
// ============================================================
export const generateTestPanorama = (width: number = 4096): string => {
  const W = width;
  const H = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Sektor warna per 90 derajat (pie slice juga kebentuk di kutub atas/bawah)
  const sectors: { name: string; color: string; u0: number; u1: number }[] = [
    { name: "FRONT", color: "#e53935", u0: 0.375, u1: 0.625 },
    { name: "RIGHT", color: "#43a047", u0: 0.625, u1: 0.875 },
    { name: "LEFT", color: "#fdd835", u0: 0.125, u1: 0.375 },
    { name: "BACK", color: "#1e88e5", u0: 0.875, u1: 1.125 }, // nyebrang seam
  ];
  for (const s of sectors) {
    ctx.fillStyle = s.color;
    ctx.fillRect(s.u0 * W, 0, (s.u1 - s.u0) * W, H);
    if (s.u1 > 1) ctx.fillRect((s.u0 - 1) * W, 0, (s.u1 - s.u0) * W, H);
  }

  // Grid: garis tiap 15 derajat, tebel tiap 45
  for (let deg = 0; deg <= 360; deg += 15) {
    const x = (deg / 360) * W;
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = deg % 45 === 0 ? 6 : 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
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

  // Label huruf besar di tengah tiap sektor (nunjukin mirror/kebalik)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const centers = [
    { t: "FRONT -Z", u: 0.5 },
    { t: "RIGHT +X", u: 0.75 },
    { t: "LEFT -X", u: 0.25 },
    { t: "BACK +Z", u: 0.0 },
    { t: "BACK +Z", u: 1.0 },
  ];
  for (const c of centers) {
    const x = c.u * W;
    ctx.font = `bold ${Math.round(H * 0.12)}px sans-serif`;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
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
