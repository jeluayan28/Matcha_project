"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Keeps server-rendered pages in sync when the user signs out in another tab
// (or their session ends), so protected pages redirect to /login.
export function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
