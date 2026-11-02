import { createBrowserClient } from "@supabase/ssr";

// Ambil ENV, kalau gagal/undefined otomatis pakai fallback string ini
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://scdnwjokipguinefgmow.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_P-1bVcy0mJe0UgJELk5YrA_kVSmwBgG";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);