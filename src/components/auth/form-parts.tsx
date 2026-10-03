import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Field({
  label,
  name,
  id = name,
  error,
  ...props
}: Omit<React.ComponentProps<"input">, "name"> & {
  label: string;
  name: string;
  id?: string;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-forest">
        {label}
      </label>
      <Input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="h-12 rounded-2xl bg-cream/60 px-4 text-base text-forest md:text-base"
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={
        variant === "error"
          ? "rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          : "rounded-2xl border border-matcha/40 bg-sage/30 px-4 py-3 text-sm text-forest"
      }
    >
      {children}
    </div>
  );
}

export function SubmitButton({
  pending,
  idle,
  busy,
}: {
  pending: boolean;
  idle: string;
  busy: string;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-full bg-matcha text-base font-medium text-forest hover:bg-matcha/85"
    >
      {pending ? busy : idle}
    </Button>
  );
}
