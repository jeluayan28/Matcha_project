"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="h-11 rounded-full border-forest/30 px-6 text-forest hover:bg-sage/70"
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <Submit />
    </form>
  );
}
