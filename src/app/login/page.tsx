"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");

  // Surface any sign-in failure forwarded from /auth/callback.
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("authError");
    if (err) setAuthError(err);
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("sent");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (!configured) {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p className="note">
          Cloud accounts aren’t set up for this site yet, so the app is running in local-only mode —
          your saved data stays in this browser / on this machine.
        </p>
        <p>
          <Link href="/app">← Back to the app</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h1 style={{ marginTop: 0 }}>Sign in</h1>
      <p className="note">
        Enter your email and we’ll send you a secure sign-in link — no password to remember.
        Accounts are invite-only.
      </p>

      {authError && (
        <p
          className="note"
          style={{ color: "crimson", border: "1px solid currentColor", borderRadius: 6, padding: "8px 10px" }}
        >
          Sign-in didn’t complete: {authError}
        </p>
      )}

      {status === "sent" ? (
        <p>
          <strong>Check your email.</strong> We sent a sign-in link to <em>{email}</em>. Click it to
          finish signing in — you can close this tab afterward.
        </p>
      ) : (
        <form onSubmit={sendLink} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
          <label style={{ display: "grid", gap: 4 }}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@firm.com"
            />
          </label>
          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send sign-in link"}
          </button>
          {status === "error" && (
            <p className="note" style={{ color: "crimson" }}>
              {message || "Couldn’t send the link. If this email wasn’t invited, ask the account owner to add it."}
            </p>
          )}
        </form>
      )}

      <p className="note" style={{ marginTop: 16 }}>
        <Link href="/app">← Back to the app</Link>
      </p>
    </div>
  );
}
