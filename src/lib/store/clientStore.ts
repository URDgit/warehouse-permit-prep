"use client";

// =====================================================================
//  PER-ACCOUNT CLIENT STORE  (browser side)
// =====================================================================
//  Projects and corrections are edited live in the browser. When the visitor
//  is signed in we keep them in their Supabase row (Row-Level Security isolates
//  each account); otherwise we keep them in localStorage exactly as before.
//  On first sign-in, any existing local data is migrated up so nothing is lost.
//
//  Writes should be DEBOUNCED by the caller — these stores auto-save on every
//  keystroke, and one network upsert per keystroke would be wasteful.
// =====================================================================

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ClientTable = "projects" | "corrections";

let _client: ReturnType<typeof createClient> | null = null;
function sb() {
  return (_client ??= createClient());
}

async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const {
      data: { session },
    } = await sb().auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore unwritable storage */
  }
}

/**
 * Load a client store: the signed-in user's Supabase row when available,
 * otherwise localStorage. On first sign-in (cloud row empty) existing local
 * data is migrated up.
 */
export async function loadClientData<T>(table: ClientTable, localKey: string, fallback: T): Promise<T> {
  const uid = await currentUserId();
  if (uid) {
    try {
      const { data, error } = await sb().from(table).select("data").eq("user_id", uid).maybeSingle();
      if (!error && data?.data != null) return data.data as T;
      const local = readLocal<T>(localKey);
      if (local != null) {
        await saveClientData(table, localKey, local); // migrate local -> cloud once
        return local;
      }
      return fallback;
    } catch {
      return readLocal<T>(localKey) ?? fallback;
    }
  }
  return readLocal<T>(localKey) ?? fallback;
}

/** Persist a client store to the user's Supabase row, or localStorage when signed out. */
export async function saveClientData<T>(table: ClientTable, localKey: string, data: T): Promise<void> {
  const uid = await currentUserId();
  if (uid) {
    try {
      await sb()
        .from(table)
        .upsert({ user_id: uid, data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      return;
    } catch {
      /* fall through to a local backup */
    }
  }
  writeLocal(localKey, data);
}
