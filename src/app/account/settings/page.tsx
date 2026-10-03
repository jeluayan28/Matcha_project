import type { Metadata } from "next";
import { LogoutButton } from "@/components/auth/logout-button";
import { PasswordForm } from "@/components/account/account-forms";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage() {
  await requireUser("/account/settings");

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section aria-labelledby="password" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 id="password" className="text-2xl font-medium text-forest">
          Change password
        </h2>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </section>

      <section aria-labelledby="session" className="h-fit rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 id="session" className="text-2xl font-medium text-forest">
          Sign out
        </h2>
        <p className="mt-2 mb-5 text-sm text-forest/70">
          Sign out of mori on this device.
        </p>
        <LogoutButton />
      </section>
    </div>
  );
}
