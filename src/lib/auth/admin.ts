import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";

// Server-side admin gate. Call it at the top of EVERY admin page and EVERY admin
// server action (actions are public POST endpoints; layouts don't re-run on navigation).
// Signed-out users go to login; signed-in customers get a 404 so the area isn't advertised.
// The role is read from the database on each call, never from the client or the JWT.
export async function requireAdmin(returnTo: string) {
  const { supabase, user } = await requireUser(returnTo);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") notFound();
  return { supabase, user };
}
