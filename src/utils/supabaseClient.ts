// FILE: src/utils/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase URL or Anon Key is missing in environment variables");
}

let client: SupabaseClient | null = null;

export function initSupabase(fullName?: string): SupabaseClient {
  client = createClient(String(supabaseUrl), String(supabaseAnonKey), {
    global: {
      headers: {
        "x-full-name": fullName ?? "",
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    const stored = localStorage.getItem("full_name") ?? "";
    initSupabase(stored);
  }
  return client!;
}

// initialize at load
initSupabase(localStorage.getItem("full_name") ?? "");

// 👉 legacy export para dili mag-error ang old imports
export const supabase = getSupabase();
