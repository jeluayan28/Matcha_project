import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Create account — Matcha" };

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/account");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Matcha to save your cart and track your orders."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-forest underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
