import { NextRequest, NextResponse } from "next/server";

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

    // Payload metadata untuk Roblox Assets API v1
    const requestPayload = {
      assetType: "Decal",
      displayName: name || "CrestSkybox_Face",
      description: "Uploaded automatically via CrestTools",
      creationContext: {
        creator: {
          [creatorType === "Group" ? "groupId" : "userId"]: creatorId,
        },
      },
    };

    const robloxFormData = new FormData();
    robloxFormData.append("request", JSON.stringify(requestPayload));
    robloxFormData.append("fileContent", file, file.name);

    // Tembak langsung ke Endpoint Resmi Roblox Open Cloud
    const res = await fetch("https://apis.roblox.com/assets/v1/assets", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: robloxFormData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Gagal upload ke Roblox Studio" },
        { status: res.status }
      );
    }

    // 1. Cek apakah Asset ID numerik sudah ada di objek response langsung
    let finalAssetId =
      data.response?.assetId || data.response?.path?.split("/").pop();

    // 2. Jika belum ada dan yang dikembalikan adalah Operation ID, lakukan polling ke Roblox
    if (!finalAssetId && data.path && data.path.startsWith("operations/")) {
      const pollUrl = `https://apis.roblox.com/assets/v1/${data.path}`;

      for (let i = 0; i < 6; i++) {
        // Tunggu 800ms sebelum cek status operation
        await new Promise((resolve) => setTimeout(resolve, 800));

        const pollRes = await fetch(pollUrl, {
          method: "GET",
          headers: { "x-api-key": apiKey },
        });

        if (pollRes.ok) {
          const pollData = await pollRes.json();
          if (pollData.done && pollData.response) {
            finalAssetId =
              pollData.response.assetId ||
              pollData.response.path?.split("/").pop();
            break;
          }
        }
      }
    }

    if (!finalAssetId) {
      return NextResponse.json(
        { error: "Gagal mengambil Asset ID numerik dari Roblox." },
        { status: 500 }
      );
    }

    // Balikan Asset ID Murni (Angka)
    return NextResponse.json({
      success: true,
      assetId: finalAssetId,
      raw: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Proxy Server Error" },
      { status: 500 }
    );
  }
}
