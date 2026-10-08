export type SkyboxFace = "up" | "dn" | "lf" | "rt" | "ft" | "bk";

export const convertEquirectToSkybox = async (
  src: string,
  faceSize: number = 1024
): Promise<Record<SkyboxFace, string>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = (err) => reject(err);
    img.onload = () => {
      const panoCanvas = document.createElement("canvas");
      panoCanvas.width = img.width;
      panoCanvas.height = img.height;
      const panoCtx = panoCanvas.getContext("2d", { willReadFrequently: true });
      
      if (!panoCtx) return reject("Gagal membuat canvas context");
      
      panoCtx.drawImage(img, 0, 0);
      const panoData = panoCtx.getImageData(0, 0, img.width, img.height);
      const srcData = panoData.data;
      const srcW = img.width;
      const srcH = img.height;

      const results: Partial<Record<SkyboxFace, string>> = {};
      const faces: SkyboxFace[] = ["ft", "bk", "lf", "rt", "up", "dn"];

      for (const face of faces) {
        const canvas = document.createElement("canvas");
        canvas.width = faceSize;
        canvas.height = faceSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        const imgData = ctx.createImageData(faceSize, faceSize);

        for (let y = 0; y < faceSize; y++) {
          for (let x = 0; x < faceSize; x++) {
            // HALF-PIXEL CENTERING: Mencegah edge bleed / piksel sudut bocor
            const nx = ((x + 0.5) / faceSize) * 2 - 1;
            const ny = ((y + 0.5) / faceSize) * 2 - 1;

            let vx = 0, vy = 0, vz = 0;

            // MATRIKS SINKRONISASI ORIENTASI ROBLOX
            switch (face) {
              case "ft": vx = nx;   vy = -ny;  vz = -1;  break; // Front
              case "bk": vx = -nx;  vy = -ny;  vz = 1;   break; // Back
              case "lf": vx = -1;   vy = -ny;  vz = -nx; break; // Left
              case "rt": vx = 1;    vy = -ny;  vz = nx;  break; // Right
              case "up": vx = ny;   vy = 1;    vz = -nx; break; // Up (Rotasi 90° CW Fix)
              case "dn": vx = -ny;  vy = -1;   vz = -nx; break; // Down (Rotasi 90° CCW Fix)
            }

            const r = Math.sqrt(vx * vx + vy * vy + vz * vz);
            vx /= r; vy /= r; vz /= r;

            const phi = Math.atan2(vx, -vz);
            const theta = Math.asin(vy);

            const u = (phi + Math.PI) / (2 * Math.PI);
            const v = (Math.PI / 2 - theta) / Math.PI;

            const px = u * srcW - 0.5;
            const py = v * srcH - 0.5;

            const x0 = (Math.floor(px) + srcW) % srcW;
            const y0 = Math.max(0, Math.min(srcH - 1, Math.floor(py)));
            const x1 = (x0 + 1) % srcW;
            const y1 = Math.min(srcH - 1, y0 + 1);

            const fx = px - Math.floor(px);
            const fy = py - Math.floor(py);

            const idx00 = (y0 * srcW + x0) * 4;
            const idx10 = (y0 * srcW + x1) * 4;
            const idx01 = (y1 * srcW + x0) * 4;
            const idx11 = (y1 * srcW + x1) * 4;

            const destIdx = (y * faceSize + x) * 4;

            // BILINEAR INTERPOLATION BLENDING
            for (let c = 0; c < 4; c++) {
              imgData.data[destIdx + c] =
                srcData[idx00 + c] * (1 - fx) * (1 - fy) +
                srcData[idx10 + c] * fx * (1 - fy) +
                srcData[idx01 + c] * (1 - fx) * fy +
                srcData[idx11 + c] * fx * fy;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        results[face] = canvas.toDataURL("image/png");
      }

      resolve(results as Record<SkyboxFace, string>);
    };
    img.src = src;
  });
};
