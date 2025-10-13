// FILE: src/utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// ✅ Create client normally
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Helper fetch wrapper (optional)
export async function safeSelect(query: any) {
  const { data, error } = await query;
  if (error) {
    console.error("Supabase Fetch Error:", error.message);
    throw error;
  }
  return data;
}
