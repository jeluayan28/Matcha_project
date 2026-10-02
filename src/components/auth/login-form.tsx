"use client";

import { useActionState } from "react";
import { login, type AuthFormState } from "@/app/(auth)/actions";
import { Field, FormAlert, SubmitButton } from "./form-parts";

export function LoginForm({
  next,
  notice,
}: {
  next?: string;
  notice?: string;
}) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    {}
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="space-y-5">
      {notice && !state.error && <FormAlert variant="error">{notice}</FormAlert>}
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={state.values?.email}
        error={errors.email}
        disabled={pending}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        error={errors.password}
        disabled={pending}
      />
      <SubmitButton pending={pending} idle="Sign in" busy="Signing in…" />
    </form>
  );
}
