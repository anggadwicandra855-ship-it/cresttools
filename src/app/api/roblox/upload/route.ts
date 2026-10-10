import { NextRequest, NextResponse } from "next/server";

// Polling Roblox bisa makan waktu, kasih ruang napas (berlaku di hosting yang support).
export const maxDuration = 60;

const ASSETS_URL = "https://apis.roblox.com/assets/v1/assets";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type AssetKind = "Image" | "Decal";

const createAsset = async (
  kind: AssetKind,
  apiKey: string,
  name: string,
  creatorType: string,
  creatorId: string,
  file: File
) => {
  const payload = {
    assetType: kind,
    displayName: name || "CrestSkybox_Face",
    description: "Uploaded automatically via CrestTools",
    creationContext: {
      creator: {
        [creatorType === "Group" ? "groupId" : "userId"]: creatorId,
      },
    },
  };

  // FormData dibuat ulang tiap percobaan
  const form = new FormData();
  form.append("request", JSON.stringify(payload));
  form.append("fileContent", file, file.name);

  const res = await fetch(ASSETS_URL, {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
};

// Cek status operation sampai selesai (max ±50 detik).
const pollOperation = async (path: string, apiKey: string) => {
  const url = `https://apis.roblox.com/assets/v1/${path}`;
  for (let i = 0; i < 40; i++) {
    await sleep(Math.min(500 + i * 150, 1500));
    const r = await fetch(url, {
      method: "GET",
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });

    if (r.status === 401 || r.status === 403) {
      return {
        error: {
          message:
            "API key ditolak saat cek status upload. Pastikan key punya izin asset:read DAN asset:write.",
        },
      };
    }
    if (!r.ok) continue;

    const d = await r.json().catch(() => null);
    if (d?.done) return d;
  }
  return null;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const apiKey = formData.get("apiKey") as string;
    const creatorType = formData.get("creatorType") as string;
    const creatorId = formData.get("creatorId") as string;
    const name = formData.get("name") as string;
    const file = formData.get("file") as File;

    if (!apiKey || !creatorId || !file) {
      return NextResponse.json(
        { error: "API Key, Creator ID, dan File wajib diisi, Bree." },
        { status: 400 }
      );
    }

    // 1. Coba upload sebagai "Image" (ID langsung bisa dipakai Sky).
    //    Kalau Roblox nolak tipenya (400), fallback ke "Decal".
    let usedType: AssetKind = "Image";
    let { res, data } = await createAsset("Image", apiKey, name, creatorType, creatorId, file);

    if (!res.ok && res.status === 400) {
      usedType = "Decal";
      ({ res, data } = await createAsset("Decal", apiKey, name, creatorType, creatorId, file));
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || `Roblox menolak upload (HTTP ${res.status})` },
        { status: res.status }
      );
    }

    // 2. Ambil hasil operation (langsung selesai, atau polling)
    let op = data;
    const needsPolling = !(op?.done && op?.response);
    if (needsPolling && typeof op?.path === "string" && op.path.startsWith("operations/")) {
      op = await pollOperation(op.path, apiKey);
      if (!op) {
        return NextResponse.json(
          {
            error:
              "Roblox masih memproses asset ini (timeout cek status). Asset mungkin sudah ke-upload, cek di Creator Hub lalu coba lagi.",
          },
          { status: 504 }
        );
      }
    }

    if (op?.error) {
      return NextResponse.json(
        { error: op.error.message || "Roblox gagal memproses asset." },
        { status: 422 }
      );
    }

    const resp = op?.response ?? data?.response ?? data;
    const finalAssetId = resp?.assetId || resp?.path?.split("/").pop();

    if (!finalAssetId) {
      return NextResponse.json(
        { error: "Upload selesai tapi Asset ID tidak ditemukan di respons Roblox." },
        { status: 500 }
      );
    }

    const moderationState: string | null =
      resp?.moderationResult?.moderationState?.replace("MODERATION_STATE_", "") ?? null;

    return NextResponse.json({
      success: true,
      assetId: String(finalAssetId),
      assetType: usedType,
      moderationState,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Proxy Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
