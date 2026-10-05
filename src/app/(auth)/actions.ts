"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth/redirect";
import {
  validateLogin,
  validateRegister,
  type FieldErrors,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
  fieldErrors?: FieldErrors;
  values?: { fullName?: string; email?: string };
};

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// Base URL for the confirmation-email link. Prefer the configured SITE_URL: the Host /
// X-Forwarded-Host headers are client-controlled and must not decide where an emailed link
// points (Supabase also checks its redirect allow-list, but don't rely on that alone).
async function getOrigin() {
  const configured = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  const next = safeNext(field(formData, "next"));

  const fieldErrors = validateLogin(email, password);
  if (Object.keys(fieldErrors).length > 0)
    return { fieldErrors, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      values: { email },
      error:
        error.code === "email_not_confirmed"
          ? "Please confirm your email first. Check your inbox for the link."
          : error.code === "over_request_rate_limit"
            ? "Too many attempts. Please wait a moment and try again."
            : "Invalid email or password.",
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function register(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const fullName = field(formData, "fullName").trim();
  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  const confirmPassword = field(formData, "confirmPassword");

  const fieldErrors = validateRegister({
    fullName,
    email,
    password,
    confirmPassword,
  });
  if (Object.keys(fieldErrors).length > 0)
    return { fieldErrors, values: { fullName, email } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the on_auth_user_created trigger to create the profile row.
      data: { full_name: fullName },
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) {
    return {
      values: { fullName, email },
      error:
        error.code === "user_already_exists"
          ? "An account with this email already exists. Try signing in."
          : error.code === "weak_password"
            ? "That password is too weak. Try a longer, less common one."
            : error.code === "over_email_send_rate_limit"
              ? "Too many sign-up emails sent. Please wait a few minutes and try again."
              : "We couldn't create your account. Please try again.",
    };
  }

  // Email confirmation off: Supabase returns a session straight away.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/account");
  }

  // Email confirmation on: no session until the link is clicked. Existing
  // addresses get the same response, so this doesn't reveal who has an account.
  return {
    message: `We've sent a confirmation link to ${email}. Open it to finish creating your account.`,
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
