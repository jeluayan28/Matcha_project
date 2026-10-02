"use server";

import { createClient } from "@/lib/supabase/server";

export type NewsletterState = {
  status?: "success" | "error";
  message?: string;
  email?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  // Hidden field only bots fill in.
  if (formData.get("company")) return { status: "success", message: "You're on the list." };

  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim() : "";

  if (!email || !EMAIL_RE.test(email) || email.length > 254)
    return { status: "error", message: "Enter a valid email address.", email };

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  // 23505 = already subscribed. Same answer as success, so the list can't be probed.
  if (error && error.code !== "23505")
    return {
      status: "error",
      message: "We couldn't sign you up right now. Please try again shortly.",
      email,
    };

  return { status: "success", message: "You're on the list. Welcome to the ritual." };
}
