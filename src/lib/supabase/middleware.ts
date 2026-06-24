import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured, authRequired } from "./config";

// Paths that never require auth. "/" is the public marketing landing page;
// it's matched exactly (startsWith("//") never matches), so /app etc. stay gated.
const PUBLIC_PATHS = ["/", "/login", "/auth"];

/**
 * Refreshes the Supabase session cookie on each request and, when auth is
 * required, redirects signed-out visitors to /login. A no-op when Supabase is
 * not configured, so the app is unchanged until env vars are added.
 */
// TEMP diagnostic: surface what the Edge middleware actually sees, via headers.
function diag(res: NextResponse): NextResponse {
  res.headers.set("x-mw-ran", "1");
  res.headers.set("x-mw-configured", String(isSupabaseConfigured()));
  res.headers.set("x-mw-require", process.env.REQUIRE_AUTH ?? "unset");
  res.headers.set("x-mw-require-public", process.env.NEXT_PUBLIC_REQUIRE_AUTH ?? "unset");
  res.headers.set("x-mw-authreq", String(authRequired()));
  return res;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = diag(NextResponse.next({ request }));
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = diag(NextResponse.next({ request }));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (authRequired() && !user) {
    const path = request.nextUrl.pathname;
    const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));
    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", path);
      return diag(NextResponse.redirect(url));
    }
  }

  return response;
}
