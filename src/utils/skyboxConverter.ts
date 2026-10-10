export type SkyboxFace = "up" | "dn" | "lf" | "rt" | "ft" | "bk";

export const convertEquirectToSkybox = async (
  src: string,
  faceSize: number = 1024,
  yawDeg: number = 0
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
      const yawRad = (yawDeg * Math.PI) / 180;

      for (const face of faces) {
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

            let vx = 0, vy = 0, vz = 0;

            // FIX CLAUDE: Matriks Absolut Native Roblox
            switch (face) {
              case "ft": vx =  nx; vy = -ny; vz = -1;  break;
              case "rt": vx =  1;  vy = -ny; vz =  nx; break;
              case "bk": vx = -nx; vy = -ny; vz =  1;  break;
              case "lf": vx = -1;  vy = -ny; vz = -nx; break;
              case "up": vx =  nx; vy =  1;  vz = -ny; break;
              case "dn": vx =  nx; vy = -1;  vz =  ny; break;
            }

            const r = Math.sqrt(vx * vx + vy * vy + vz * vz);
            vx /= r; vy /= r; vz /= r;

            const phi = Math.atan2(vx, -vz) + yawRad;
            const theta = Math.asin(vy);

            const u = (phi + Math.PI) / (2 * Math.PI);
            const v = (Math.PI / 2 - theta) / Math.PI;

            const uClamped = Math.max(0, Math.min(u, 1 - 1e-6));
            const vClamped = Math.max(0, Math.min(v, 1 - 1e-6));

            const px = uClamped * (srcW - 1);
            const py = vClamped * (srcH - 1);

            const x0 = Math.floor(px);
            const y0 = Math.floor(py);
            const x1 = Math.min(x0 + 1, srcW - 1);
            const y1 = Math.min(y0 + 1, srcH - 1);

            const fx = px - x0;
            const fy = py - y0;

            const idx00 = (y0 * srcW + x0) * 4;
            const idx10 = (y0 * srcW + x1) * 4;
            const idx01 = (y1 * srcW + x0) * 4;
            const idx11 = (y1 * srcW + x1) * 4;

            const destIdx = (y * faceSize + x) * 4;

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
