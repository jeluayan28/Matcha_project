-- Newsletter signups from the landing page.
-- Run in the Supabase SQL Editor after the initial schema.
create table public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at  timestamptz not null default now()
);

create unique index newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

-- Visitors can add themselves; nobody can read the list from the client.
create policy "newsletter_insert_public" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

revoke all on public.newsletter_subscribers from anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
