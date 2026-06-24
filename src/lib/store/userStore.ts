// =====================================================================
//  PER-ACCOUNT STORE  (server side)
// =====================================================================
//  Reads/writes a signed-in user's JSON row in Supabase. Returns "no user"
//  signals (null / reason) so the callers can fall back to the existing
//  on-disk behavior when accounts are off (local dev) or nobody is signed in.
//  Row-Level Security guarantees a user can only ever touch their own row.
// =====================================================================

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type StoreTable = "firm_profiles" | "libraries" | "overrides" | "projects" | "corrections";

export async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** The signed-in user's stored JSON for a table, or null if accounts off / no row. */
export async function readUserData<T>(table: StoreTable): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from(table).select("data").eq("user_id", user.id).maybeSingle();
    if (error) return null;
    return (data?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export type WriteResult = { ok: true } | { ok: false; reason: "not-configured" | "not-signed-in" | string };

export async function writeUserData(table: StoreTable, data: unknown): Promise<WriteResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "not-configured" };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "not-signed-in" };
    const { error } = await supabase
      .from(table)
      .upsert({ user_id: user.id, data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
