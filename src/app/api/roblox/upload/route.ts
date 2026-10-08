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

    // Balikan Operation / Asset ID
    return NextResponse.json({
      success: true,
      assetId: data.assetId || data.path?.split("/").pop(),
      raw: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Proxy Server Error" },
      { status: 500 }
    );
  }
}
