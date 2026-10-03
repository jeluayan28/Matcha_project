import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth/validation";

const PHONE_RE = /^[+()\d][\d\s().-]{5,19}$/;

export type ProfileErrors = Partial<Record<"fullName" | "phone", string>>;
export type PasswordErrors = Partial<
  Record<"currentPassword" | "newPassword" | "confirmPassword", string>
>;

export function validateProfile(fullName: string, phone: string): ProfileErrors {
  const e: ProfileErrors = {};
  if (!fullName) e.fullName = "Enter your name.";
  else if (fullName.length > 100) e.fullName = "Name is too long.";
  if (phone && !PHONE_RE.test(phone)) e.phone = "Enter a valid phone number.";
  return e;
}

export function validatePasswordChange(
  current: string,
  next: string,
  confirm: string
): PasswordErrors {
  const e: PasswordErrors = {};
  if (!current) e.currentPassword = "Enter your current password.";
  if (next.length < PASSWORD_MIN)
    e.newPassword = `Use at least ${PASSWORD_MIN} characters.`;
  else if (new TextEncoder().encode(next).length > PASSWORD_MAX)
    e.newPassword = `Use at most ${PASSWORD_MAX} characters.`;
  else if (next === current) e.newPassword = "Choose a different password.";
  if (!e.newPassword && next !== confirm)
    e.confirmPassword = "Passwords don't match.";
  return e;
}
