"use client";

import { useActionState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { subscribe, type NewsletterState } from "@/app/actions/newsletter";

export function Newsletter() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribe,
    {}
  );

  return (
    <section id="newsletter" className="scroll-mt-16 bg-cream pb-20 md:pb-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-8 rounded-3xl bg-forest px-6 py-12 text-cream sm:px-12 md:grid-cols-2 md:items-center md:gap-14 md:py-16">
          <div>
            <Eyebrow tone="dark">Newsletter</Eyebrow>
            <h2 className="mt-4 text-4xl leading-[1.05] font-medium sm:text-5xl">
              Join the ritual
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-cream/75">
              New blends, brewing tips and early access to each harvest. Sent
              rarely, never spammy.
            </p>
          </div>

          {state.status === "success" ? (
            <p
              role="status"
              className="rounded-2xl border border-gold/50 bg-cream/5 px-5 py-4 text-cream"
            >
              {state.message}
            </p>
          ) : (
            <form action={action} noValidate>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  defaultValue={state.email}
                  disabled={pending}
                  aria-invalid={state.status === "error" ? true : undefined}
                  aria-describedby={
                    state.status === "error" ? "newsletter-error" : undefined
                  }
                  className="h-12 min-w-0 sm:flex-1 rounded-full border border-cream/25 bg-cream/10 px-5 text-base text-cream outline-none placeholder:text-cream/50 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/40 disabled:opacity-60"
                />
                {/* Honeypot: hidden from people, filled in by bots. */}
                <input
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="h-12 rounded-full bg-gold px-8 text-base font-medium text-forest transition-colors hover:bg-cream focus-visible:ring-3 focus-visible:ring-gold/40 focus-visible:outline-none disabled:opacity-60"
                >
                  {pending ? "Subscribing…" : "Subscribe"}
                </button>
              </div>
              {state.status === "error" && (
                <p
                  id="newsletter-error"
                  role="alert"
                  className="mt-3 text-sm text-[#ffb4a6]"
                >
                  {state.message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
