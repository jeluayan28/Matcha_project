-- Matcha e-commerce: initial schema
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Designed to be run once on an empty `public` schema.

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at current
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile whenever someone signs up.
-- SECURITY DEFINER is required here (the signing-up user has no INSERT right);
-- it takes no arguments, only writes the new user's own row, and EXECUTE is revoked.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  slug         text not null unique,
  description  text,
  image_url    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories (id) on delete set null,
  name         text not null,
  slug         text not null unique,
  description  text,
  price        numeric(10, 2) not null check (price >= 0),
  image_url    text,
  stock        integer not null default 0 check (stock >= 0),
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_featured_idx on public.products (created_at desc) where is_featured;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- orders
-- Deleting a profile is blocked while the user has orders (keeps sales records).
-- ---------------------------------------------------------------------------
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete restrict,
  total_amount      numeric(10, 2) not null check (total_amount >= 0),
  status            text not null default 'pending'
                    check (status in ('pending', 'paid', 'processing', 'shipped',
                                      'delivered', 'cancelled', 'refunded')),
  shipping_address  jsonb not null,
  created_at        timestamptz not null default now()
);

create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- order_items (price is a snapshot at purchase time)
-- ---------------------------------------------------------------------------
create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete restrict,
  quantity    integer not null check (quantity > 0),
  price       numeric(10, 2) not null check (price >= 0),
  unique (order_id, product_id)
);

create index order_items_product_id_idx on public.order_items (product_id);
-- order_id is covered by the unique (order_id, product_id) index.

-- ---------------------------------------------------------------------------
-- cart_items
-- ---------------------------------------------------------------------------
create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index cart_items_product_id_idx on public.cart_items (product_id);
-- user_id is covered by the unique (user_id, product_id) index.

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- product_reviews (one review per user per product)
-- ---------------------------------------------------------------------------
create table public.product_reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  title       text,
  comment     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create index product_reviews_user_id_idx on public.product_reviews (user_id);
-- product_id is covered by the unique (product_id, user_id) index.

create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.cart_items      enable row level security;
alter table public.product_reviews enable row level security;

-- profiles: own row only (created by trigger, never deleted from the client)
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- categories / products: public read, no client writes
create policy "categories_select_public" on public.categories
  for select to anon, authenticated
  using (true);

create policy "products_select_public" on public.products
  for select to anon, authenticated
  using (true);

-- orders / order_items: customers can only READ their own.
-- Orders are created server-side (service role or a checkout function) so a
-- client can never set its own total_amount, price or status.
create policy "orders_select_own" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "order_items_select_own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- cart_items: full control over own cart
create policy "cart_items_select_own" on public.cart_items
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "cart_items_insert_own" on public.cart_items
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "cart_items_update_own" on public.cart_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "cart_items_delete_own" on public.cart_items
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- product_reviews: public read, write only your own
create policy "product_reviews_select_public" on public.product_reviews
  for select to anon, authenticated
  using (true);

create policy "product_reviews_insert_own" on public.product_reviews
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "product_reviews_update_own" on public.product_reviews
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "product_reviews_delete_own" on public.product_reviews
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Data API grants (least privilege; RLS still applies on top)
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.categories, public.products, public.orders,
              public.order_items, public.cart_items, public.product_reviews
  from anon, authenticated;

grant select on public.categories, public.products, public.product_reviews to anon;

grant select on public.categories, public.products to authenticated;
grant select, update (full_name, phone, avatar_url) on public.profiles to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update, delete on public.product_reviews to authenticated;
