"use client";

import Link from "next/link";
import { StatusPage, statusButton, statusButtonOutline } from "@/components/ui/status-page";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <StatusPage
      eyebrow="Something went wrong"
      title="We hit a small snag"
      actions={
        <>
          <button type="button" onClick={reset} className={statusButton}>
            Try again
          </button>
          <Link href="/" className={statusButtonOutline}>
            Back home
          </Link>
        </>
      }
    >
      Nothing you did. Please try again in a moment.
    </StatusPage>
  );
}
