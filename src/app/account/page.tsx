import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My account — Matcha" };

export default async function AccountPage() {
  const supabase = await createClient();

  // getUser() re-validates the session with Supabase Auth, unlike a cookie read.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  // RLS limits this to the signed-in user's own row.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.full_name ?? (user.user_metadata?.full_name as string | undefined);
  const memberSince = new Date(
    profile?.created_at ?? user.created_at
  ).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center bg-cream px-5 py-14">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-border bg-card px-6 py-9 shadow-sm shadow-forest/5 sm:px-10">
          <h1 className="text-4xl font-medium text-forest">
            {name ? `Hello, ${name.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your details and sign out below.
          </p>

          <dl className="mt-8 divide-y divide-border text-sm">
            <Row label="Name" value={name} />
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={profile?.phone} />
            <Row label="Member since" value={memberSince} />
          </dl>

          <div className="mt-8">
            <LogoutButton />
          </div>
        </div>
      </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-forest">
        {value || <span className="font-normal text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}
