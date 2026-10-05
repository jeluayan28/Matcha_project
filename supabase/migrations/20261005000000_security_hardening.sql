-- Security hardening (run in the Supabase SQL Editor after the earlier migrations).
--
-- Why: the Data API (PostgREST) is reachable by anyone holding the public anon key, so the
-- checks in the Next.js server actions can be skipped by calling it directly. Everything
-- below enforces the same limits inside the database.
--
--   1. place_order builds the stored shipping address itself: only known keys, bounded
--      lengths, and the email comes from the verified JWT (a caller can't spoof it or
--      stuff arbitrary / huge JSON into orders.shipping_address).
--   2. Size limits on user-writable text and quantities (cart, reviews, profile).
--   3. handle_new_user truncates the sign-up metadata so a long name can't break sign-up
--      now that profiles has length limits.

-- ---------------------------------------------------------------------------
-- 1. place_order: whitelist + bound the shipping address
-- ---------------------------------------------------------------------------
create or replace function public.place_order(p_shipping jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user   uuid := auth.uid();
  v_email  text := auth.jwt() ->> 'email';
  v_order  uuid;
  v_total  numeric(10, 2);
  v_bad    text;
  v_ship   jsonb;
  k        text;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_shipping is null or jsonb_typeof(p_shipping) <> 'object' then
    raise exception 'invalid_shipping' using errcode = 'P0001';
  end if;
  foreach k in array array['full_name', 'line1', 'city', 'postal_code', 'country'] loop
    if coalesce(btrim(p_shipping ->> k), '') = '' then
      raise exception 'invalid_shipping' using errcode = 'P0001', detail = k;
    end if;
  end loop;
  if coalesce(btrim(v_email), '') = '' then
    raise exception 'invalid_shipping' using errcode = 'P0001', detail = 'email';
  end if;

  -- Keep only the known keys, trimmed and length-capped. The email is the session's.
  v_ship := jsonb_build_object(
    'full_name',   left(btrim(p_shipping ->> 'full_name'), 200),
    'email',       left(btrim(v_email), 254),
    'phone',       nullif(left(btrim(coalesce(p_shipping ->> 'phone', '')), 40), ''),
    'line1',       left(btrim(p_shipping ->> 'line1'), 200),
    'line2',       nullif(left(btrim(coalesce(p_shipping ->> 'line2', '')), 200), ''),
    'city',        left(btrim(p_shipping ->> 'city'), 200),
    'state',       nullif(left(btrim(coalesce(p_shipping ->> 'state', '')), 200), ''),
    'postal_code', left(btrim(p_shipping ->> 'postal_code'), 40),
    'country',     left(btrim(p_shipping ->> 'country'), 200)
  );

  -- Lock the products in the cart (in id order, to avoid deadlocks between buyers).
  perform 1
  from public.products p
  join public.cart_items c on c.product_id = p.id
  where c.user_id = v_user
  order by p.id
  for update of p;

  if not found then
    raise exception 'empty_cart' using errcode = 'P0001';
  end if;

  select p.name into v_bad
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user and p.stock < c.quantity
  order by p.name
  limit 1;

  if v_bad is not null then
    raise exception 'insufficient_stock' using errcode = 'P0001', detail = v_bad;
  end if;

  select sum(p.price * c.quantity) into v_total
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user;

  -- A concurrent checkout by the same user may have emptied the cart in the meantime.
  if v_total is null then
    raise exception 'empty_cart' using errcode = 'P0001';
  end if;

  insert into public.orders (user_id, total_amount, status, shipping_address)
  values (v_user, v_total, 'pending', v_ship)
  returning id into v_order;

  insert into public.order_items (order_id, product_id, quantity, price)
  select v_order, p.id, c.quantity, p.price
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.product_id = p.id and c.user_id = v_user;

  delete from public.cart_items where user_id = v_user;

  return v_order;
end;
$$;

revoke execute on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Limits on user-writable columns (the app enforces the same; this stops direct API use)
-- ---------------------------------------------------------------------------
alter table public.cart_items
  add constraint cart_items_quantity_max check (quantity <= 1000);

alter table public.product_reviews
  add constraint product_reviews_title_len   check (char_length(title)   <= 120),
  add constraint product_reviews_comment_len check (char_length(comment) <= 2000);

alter table public.profiles
  add constraint profiles_full_name_len  check (char_length(full_name)  <= 100),
  add constraint profiles_phone_len      check (char_length(phone)       <= 30),
  add constraint profiles_avatar_url_len check (char_length(avatar_url) <= 500);

-- ---------------------------------------------------------------------------
-- 3. Sign-up trigger: truncate metadata to the new limits.
--    Still reads ONLY full_name and avatar_url: `role` can never come from sign-up data.
-- ---------------------------------------------------------------------------
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
    left(new.raw_user_meta_data ->> 'full_name', 100),
    left(new.raw_user_meta_data ->> 'avatar_url', 500)
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
