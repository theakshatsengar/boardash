import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Trim so empty/whitespace-only env values (e.g. an unfilled .env) count as "not set".
const supabaseUrl = rawUrl?.trim() || "";
const supabaseAnonKey = rawAnonKey?.trim() || "";

/**
 * True when both Supabase env vars are present. The auth UI uses this to show
 * a helpful "not configured" message instead of throwing at runtime.
 */
export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/**
 * Browser Supabase client. Persists the session in localStorage and refreshes
 * tokens automatically. When env vars are missing we pass syntactically valid
 * placeholder values so importing this module never throws (createClient
 * validates the URL eagerly); callers must gate real usage behind
 * `isSupabaseConfigured`.
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
