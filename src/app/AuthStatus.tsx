import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Header sign-in / sign-out control. Renders nothing (and touches no cookies)
 * when Supabase is not configured, so the app stays statically rendered until
 * accounts are turned on.
 */
export default async function AuthStatus() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-out visitors see no auth affordance: the public site is a service
  // one-pager (current phase), not the app. The tool at /app still works —
  // navigating there redirects to /login for authorized users.
  if (!user) return null;

  return (
    <form
      action="/auth/signout"
      method="post"
      style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}
    >
      <span style={{ fontSize: 12, opacity: 0.85 }}>{user.email}</span>
      <button
        type="submit"
        style={{
          fontSize: 12,
          background: "none",
          border: "1px solid currentColor",
          borderRadius: 6,
          padding: "2px 8px",
          cursor: "pointer",
          color: "inherit",
        }}
      >
        Sign out
      </button>
    </form>
  );
}
