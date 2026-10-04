import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in — Matcha" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNext(next);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect(target);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Matcha account."
      footer={
        <>
          New here?{" "}
          <Link
            href="/register"
            className="inline-block py-3 font-medium text-forest underline underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm
        next={target}
        notice={
          error === "confirmation"
            ? "That confirmation link is invalid or expired. If you've already confirmed, sign in below."
            : undefined
        }
      />
    </AuthShell>
  );
}
