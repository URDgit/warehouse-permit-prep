// =====================================================================
//  SUPABASE CONFIG / FEATURE GATING
// =====================================================================
//  The whole accounts layer is OPTIONAL. With no env vars set, the app runs
//  exactly as before (local-only storage, no login). Adding the two public
//  env vars turns on accounts; flipping REQUIRE_AUTH then forces sign-in.
// =====================================================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True once the Supabase project URL + anon key are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * When true, signed-out visitors are redirected to /login. Kept separate from
 * isSupabaseConfigured() so we can connect the database first and only flip
 * the "login required" switch once per-account data is wired up and verified.
 */
export function authRequired(): boolean {
  return isSupabaseConfigured() && process.env.REQUIRE_AUTH === "true";
}
