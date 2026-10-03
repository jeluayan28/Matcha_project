"use client";

import { useActionState } from "react";
import {
  changePassword,
  updateProfile,
  type PasswordState,
  type ProfileState,
} from "@/app/actions/account";
import { Field, FormAlert } from "@/components/auth/form-parts";

const submit =
  "inline-flex h-11 items-center justify-center rounded-full bg-matcha px-7 text-sm font-medium text-forest transition-colors hover:bg-matcha/85 disabled:cursor-not-allowed disabled:opacity-60";

export function ProfileForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {}
  );
  const v = state.values ?? { fullName, phone };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.message && (
        <FormAlert variant={state.status === "success" ? "success" : "error"}>
          {state.message}
        </FormAlert>
      )}
      <Field label="Full name" name="fullName" autoComplete="name" required defaultValue={v.fullName} error={e.fullName} />
      <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} error={e.phone} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(
    changePassword,
    {}
  );
  const e = state.fieldErrors ?? {};

  return (
    // Remount on success so the password fields are cleared.
    <form
      key={state.status === "success" ? "done" : "form"}
      action={action}
      className="space-y-4"
      noValidate
    >
      {state.message && (
        <FormAlert variant={state.status === "success" ? "success" : "error"}>
          {state.message}
        </FormAlert>
      )}
      <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" required error={e.currentPassword} />
      <Field label="New password" name="newPassword" type="password" autoComplete="new-password" required error={e.newPassword} />
      <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required error={e.confirmPassword} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
