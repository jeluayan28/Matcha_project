"use client";

import { useActionState } from "react";
import { register, type AuthFormState } from "@/app/(auth)/actions";
import { PASSWORD_MIN } from "@/lib/auth/validation";
import { Field, FormAlert, SubmitButton } from "./form-parts";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    register,
    {}
  );
  const errors = state.fieldErrors ?? {};

  if (state.message) {
    return <FormAlert variant="success">{state.message}</FormAlert>;
  }

  return (
    <form action={action} noValidate className="space-y-5">
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        placeholder="Your name"
        defaultValue={state.values?.fullName}
        error={errors.fullName}
        disabled={pending}
      />
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
        autoComplete="new-password"
        placeholder={`At least ${PASSWORD_MIN} characters`}
        error={errors.password}
        disabled={pending}
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={errors.confirmPassword}
        disabled={pending}
      />
      <SubmitButton
        pending={pending}
        idle="Create account"
        busy="Creating account…"
      />
    </form>
  );
}
