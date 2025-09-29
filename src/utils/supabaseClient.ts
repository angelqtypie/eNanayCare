// FILE: src/utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;  
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;



// ✅ Single client instance only
export const supabase = createClient(supabaseUrl, supabaseAnonKey);