import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/account/account-forms";
import { formatDate } from "@/lib/account/status";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My account" };

export default async function ProfilePage() {
  const { supabase, user } = await requireUser("/account");

  // RLS limits this to the signed-in user's own row; the filter makes it explicit.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, phone, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section aria-labelledby="profile" className="h-fit rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 id="profile" className="text-2xl font-medium text-forest">
          Profile
        </h2>
        <dl className="mt-5 divide-y divide-border text-sm">
          <Row label="Name" value={fullName} />
          <Row label="Email" value={user.email} />
          <Row label="Phone" value={profile?.phone} />
          {profile?.role === "admin" && <Row label="Role" value="Admin" />}
          <Row label="Member since" value={formatDate(profile?.created_at ?? user.created_at)} />
        </dl>
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-matcha px-6 text-sm font-medium text-white hover:bg-forest"
          >
            Admin dashboard
          </Link>
        )}
      </section>

      <section aria-labelledby="edit" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 id="edit" className="text-2xl font-medium text-forest">
          Edit details
        </h2>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            We couldn&apos;t load your profile. Refresh the page to try again.
          </p>
        ) : (
          <div className="mt-5">
            <ProfileForm fullName={fullName} phone={profile?.phone ?? ""} />
          </div>
        )}
        <p className="mt-4 text-xs text-forest/60">
          Your email is your sign-in and can&apos;t be changed here.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5">
      <dt className="text-forest/60">{label}</dt>
      <dd className="text-right font-medium text-forest">
        {value || <span className="font-normal text-forest/50">—</span>}
      </dd>
    </div>
  );
}
