# Turning on hosted accounts (Supabase) — ~5–10 minutes

The app works fine **without** this (local-only mode). Follow these steps when
you want logins + saved data (firm profile, projects, verified values,
libraries, corrections) to live in the cloud per account instead of in one
browser. Accounts are **invite-only** — only people you add can sign in.

You only do steps 1–5 once. After that, tell me it's connected and I'll move
the saved data into accounts and verify it live.

---

## 1. Create a free Supabase project
1. Go to **https://supabase.com** → sign up / log in.
2. **New project**. Pick a name (e.g. `warehouse-permit-prep`), a strong
   database password (save it somewhere), and the region closest to you
   (e.g. *West US*). Click **Create new project** and wait ~2 minutes.

## 2. Create the database tables
1. In the project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file **`supabase/schema.sql`** from this repo, copy everything,
   paste it into the editor, and click **Run**. You should see "Success".
   (It's safe to run again later.)

## 3. Make sign-ups invite-only
1. Left sidebar → **Authentication** → **Sign In / Providers** (or
   **Providers** → **Email**). Make sure **Email** is enabled.
2. Left sidebar → **Authentication** → **Settings** (sometimes under
   *Configuration*). Turn **OFF** "Allow new users to sign up".
   → Now only people you invite can get in.
3. Invite yourself: **Authentication** → **Users** → **Add user / Invite** →
   enter your email.

## 4. Grab your keys
1. Left sidebar → **Project Settings** → **API**.
2. Copy two values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (The anon key is meant to be public — security is enforced by the database
   rules from step 2. You do **not** need the secret `service_role` key.)

## 5. Add the keys to the live site (Vercel)
1. In **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
   - *(leave `REQUIRE_AUTH` unset for now — we flip it on after the data is
     wired up so the site never locks you out mid-setup.)*
3. **Redeploy** (Deployments → ⋯ → Redeploy, or just push any commit).

### (Optional) Run it locally too
Create a file named **`.env.local`** in the project folder (copy `.env.example`)
and paste the same two values. Then `npm run dev`.

---

## What you'll see once connected
- A **Sign in** link appears in the header. Sign in with your email → you get a
  one-time magic link (no password). Only invited emails work.
- Right now the app still saves data locally — **that's expected**. The next
  step (which I'll do) is moving each saved item into your account, then turning
  on `REQUIRE_AUTH`. Tell me once steps 1–5 are done.

## How security works (plain version)
Each table has Row-Level Security: the database itself only lets you read/write
rows tagged with your own user id. Even with the public anon key, no one can see
another account's data. Nothing here stores or computes engineering values — it
stores the same drafting data the app already produced, just per account.
