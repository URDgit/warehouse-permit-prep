import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// IMPORTANT: this file must live in src/ (this project uses a src/ directory).
// Next.js only picks up middleware at the same level as the app dir — a
// root-level middleware.ts is silently ignored and never runs.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on everything except static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
