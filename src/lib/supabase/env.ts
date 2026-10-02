// NEXT_PUBLIC_* vars must be referenced statically so Next.js can inline them
// into the browser bundle. Do not read them via process.env[name].
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnv() {
  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean);

  if (!url || !anonKey) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local, fill them in from your Supabase ` +
        `dashboard (Project Settings > API), then restart the dev server.`
    );
  }

  return { url, anonKey };
}
