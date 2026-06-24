import { NextResponse } from "next/server";

// Diagnostic only: reports whether the server sees the Supabase env vars.
// Returns booleans, never the secret values. Always dynamic so it reflects
// the live runtime environment (not a build-time snapshot).
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    requireAuth: process.env.REQUIRE_AUTH ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  });
}
