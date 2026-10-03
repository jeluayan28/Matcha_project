import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// getUser() re-validates the session with Supabase Auth (a cookie read does not).
// Call this in every protected page: layouts don't re-run on client navigation.
export async function requireUser(returnTo: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return { supabase, user };
}
