-- Checkout: place_order(shipping) turns the caller's cart into an order atomically.
-- Run in the Supabase SQL Editor after the initial schema.
--
-- Clients cannot write orders / order_items / products (no grants), so this
-- SECURITY DEFINER function is the only way an order is created. It:
--   * identifies the buyer from auth.uid() (never from an argument),
--   * locks the cart's product rows so concurrent checkouts cannot oversell,
--   * takes prices and totals from the database, never from the client,
--   * creates the order + items, decrements stock and empties the cart,
-- all in one transaction: any failure rolls everything back.
--
-- Errors (SQLSTATE P0001, message is the code):
--   not_authenticated | empty_cart | invalid_shipping |
--   insufficient_stock (DETAIL = product name)

create or replace function public.place_order(p_shipping jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user   uuid := auth.uid();
  v_order  uuid;
  v_total  numeric(10, 2);
  v_bad    text;
  k        text;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_shipping is null or jsonb_typeof(p_shipping) <> 'object' then
    raise exception 'invalid_shipping' using errcode = 'P0001';
  end if;
  foreach k in array array['full_name', 'email', 'line1', 'city', 'postal_code', 'country'] loop
    if coalesce(btrim(p_shipping ->> k), '') = '' then
      raise exception 'invalid_shipping' using errcode = 'P0001', detail = k;
    end if;
  end loop;

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

  insert into public.orders (user_id, total_amount, status, shipping_address)
  values (v_user, v_total, 'pending', p_shipping)
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
