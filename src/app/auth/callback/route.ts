import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "@/lib/supabase/config";

// Completes sign-in after the user clicks the email link. Handles both the
// PKCE `?code=` flow and the `?token_hash=&type=` (magic-link) flow, and
// writes the session cookies directly onto the redirect response so they
// actually persist. On failure it forwards the real reason to /login.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const providerError = searchParams.get("error_description") || searchParams.get("error");

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/login?authError=${encodeURIComponent(reason)}`);

  if (!isSupabaseConfigured()) return fail("Accounts are not configured on this site.");
  if (providerError) return fail(providerError);
  if (!code && !tokenHash) return fail("The sign-in link was missing its token. Request a fresh link.");

  const cookieStore = await cookies();
  // Build the success response up front so the auth library can write the
  // session cookies onto it.
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ type: type ?? "email", token_hash: tokenHash! });

  if (error) return fail(error.message);
  return response;
}
