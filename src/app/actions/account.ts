"use server";

import { revalidatePath } from "next/cache";
import {
  validatePasswordChange,
  validateProfile,
  type PasswordErrors,
  type ProfileErrors,
} from "@/lib/account/validation";
import { requireUser } from "@/lib/auth/session";

export type ProfileState = {
  status?: "success" | "error";
  message?: string;
  fieldErrors?: ProfileErrors;
  values?: { fullName: string; phone: string };
};

export type PasswordState = {
  status?: "success" | "error";
  message?: string;
  fieldErrors?: PasswordErrors;
};

function field(formData: FormData, name: string) {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const { supabase, user } = await requireUser("/account");
  const fullName = field(formData, "fullName").trim();
  const phone = field(formData, "phone").trim();
  const values = { fullName, phone };

  const fieldErrors = validateProfile(fullName, phone);
  if (Object.keys(fieldErrors).length > 0)
    return { status: "error", fieldErrors, values };

  // Scoped to the caller's own row; RLS and column grants enforce the same in the database.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);
  if (error)
    return {
      status: "error",
      values,
      message: "We couldn't save your changes. Please try again.",
    };

  revalidatePath("/account");
  return { status: "success", values, message: "Your profile has been updated." };
}

export async function changePassword(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const { supabase, user } = await requireUser("/account/settings");
  const current = field(formData, "currentPassword");
  const next = field(formData, "newPassword");
  const confirm = field(formData, "confirmPassword");

  const fieldErrors = validatePasswordChange(current, next, confirm);
  if (Object.keys(fieldErrors).length > 0) return { status: "error", fieldErrors };

  // Re-verify the current password so a hijacked session can't silently change it.
  if (!user.email) return { status: "error", message: "Password sign-in isn't set up for this account." };
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyError)
    return {
      status: "error",
      fieldErrors: { currentPassword: "That password isn't correct." },
    };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error)
    return {
      status: "error",
      message:
        error.code === "weak_password"
          ? "That password is too weak. Try a longer, less common one."
          : error.code === "same_password"
            ? "Choose a different password."
            : "We couldn't update your password. Please try again.",
    };

  return { status: "success", message: "Your password has been updated." };
}
