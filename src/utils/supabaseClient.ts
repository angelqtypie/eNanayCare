import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase URL or Anon Key is missing in .env");
}

// Get full_name from localStorage (kay mao atong gamit sa policy)
const fullName = localStorage.getItem("full_name") || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      "x-full-name": fullName, // 👈 mao ni ang secret ingredient para mo-work imong RLS
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
