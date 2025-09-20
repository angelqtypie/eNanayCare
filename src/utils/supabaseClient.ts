import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase URL or Anon Key is missing in .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);





export async function fetchMothers(): Promise<any[]> {
  if (!supabase) throw new Error("Supabase client not configured.");
  const { data, error } = await supabase.from("mothers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAppointments(): Promise<any[]> {
  if (!supabase) throw new Error("Supabase client not configured.");
  const { data, error } = await supabase.from("appointments").select("*").order("start_time", { ascending: true });
  if (error) throw error;
  return data || [];
}