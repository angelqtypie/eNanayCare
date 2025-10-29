import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Generic email sender function
export async function sendEmail(
  to: string,
  subject: string,
  type: "reminder" | "alert" | "welcome",
  data: Record<string, string>
) {
  const { data: res, error } = await supabase.functions.invoke("send-email", {
    body: { to, subject, type, data },
  });

  if (error) {
    console.error("Email error:", error);
    throw error;
  }

  return res;
}
