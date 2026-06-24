import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Note: REQUIRE_AUTH is evaluated in updateSession(); a change to it needs a
// fresh build (Edge middleware bakes env vars in at build time), not just a
// cached redeploy.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on everything except static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
