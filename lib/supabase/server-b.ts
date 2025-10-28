import { createClient } from "@supabase/supabase-js";

export function createServiceClientB() {
  // Service role: no cookies, no browser usage
  // RLS is bypassed - use only in server code
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_B!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
