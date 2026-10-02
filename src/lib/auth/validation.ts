export type FieldErrors = Partial<
  Record<"fullName" | "email" | "password" | "confirmPassword", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
// bcrypt (used by Supabase Auth) ignores everything past 72 bytes.
export const PASSWORD_MAX = 72;

function checkEmail(email: string) {
  if (!email) return "Enter your email address.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
}

export function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function validateRegister(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const { fullName, email, password, confirmPassword } = input;

  if (!fullName) errors.fullName = "Enter your name.";
  else if (fullName.length > 100) errors.fullName = "Name is too long.";

  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;

  if (password.length < PASSWORD_MIN)
    errors.password = `Use at least ${PASSWORD_MIN} characters.`;
  else if (new TextEncoder().encode(password).length > PASSWORD_MAX)
    errors.password = `Use at most ${PASSWORD_MAX} characters.`;

  if (!errors.password && password !== confirmPassword)
    errors.confirmPassword = "Passwords don't match.";

  return errors;
}
