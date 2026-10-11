// Kredensial Roblox (API key) untuk upload otomatis.
// Disimpan di localStorage browser. Metode ini SEMENTARA dan akan diganti
// login Roblox (OAuth). Dipisah dari page.tsx supaya aman dari aturan export Next.js.

export interface RobloxCredentials {
  apiKey: string;
  creatorType: "User" | "Group";
  creatorId: string;
}

export const ROBLOX_CREDENTIALS_KEY = "crest_roblox_credentials";

/** Baca kredensial dari localStorage. Balikin null kalau belum lengkap. */
export const loadRobloxCredentials = (): RobloxCredentials | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ROBLOX_CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RobloxCredentials>;
    if (!parsed.apiKey || !parsed.creatorId) return null;
    return {
      apiKey: parsed.apiKey,
      creatorType: parsed.creatorType === "Group" ? "Group" : "User",
      creatorId: parsed.creatorId,
    };
  } catch {
    return null;
  }
};

export const saveRobloxCredentials = (creds: RobloxCredentials) => {
  localStorage.setItem(ROBLOX_CREDENTIALS_KEY, JSON.stringify(creds));
};

export const clearRobloxCredentials = () => {
  localStorage.removeItem(ROBLOX_CREDENTIALS_KEY);
};
