-- Admin dashboard: roles, admin RLS policies, admin-only functions, product-image storage.
-- Run in the Supabase SQL Editor after the earlier migrations.
--
-- Security model
--   * profiles.role is 'customer' (default) or 'admin'. Customers have NO update grant on
--     that column (column grants on profiles stay limited to full_name/phone/avatar_url),
--     so nobody can promote themselves. Admins are created manually (see bottom).
--   * is_admin() is the single source of truth, used by RLS policies and functions.
--   * Admin pages use the normal signed-in client: RLS lets admins write products,
--     categories, storage objects and read everything; customers are denied by RLS even if
--     the app code had a bug. No service-role key is needed.

-- ---------------------------------------------------------------------------
-- Role column + is_admin()
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column role text not null default 'customer'
  check (role in ('customer', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: admins may read all profiles/orders/items and manage the catalog.
-- (Policies are permissive and OR-ed with the existing own-row policies.)
-- ---------------------------------------------------------------------------
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using ((select public.is_admin()));

create policy "orders_select_admin" on public.orders
  for select to authenticated
  using ((select public.is_admin()));

create policy "order_items_select_admin" on public.order_items
  for select to authenticated
  using ((select public.is_admin()));

create policy "categories_insert_admin" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "categories_update_admin" on public.categories
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories_delete_admin" on public.categories
  for delete to authenticated using ((select public.is_admin()));

create policy "products_insert_admin" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products_update_admin" on public.products
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products_delete_admin" on public.products
  for delete to authenticated using ((select public.is_admin()));

-- Table privileges are required in addition to policies. Without a matching admin policy
-- (i.e. for customers) these writes are still rejected by RLS.
grant insert, update, delete on public.categories, public.products to authenticated;

-- ---------------------------------------------------------------------------
-- Dashboard statistics
-- Revenue counts orders that are paid or beyond; pending, cancelled and refunded are excluded.
-- ---------------------------------------------------------------------------
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_products',  (select count(*) from public.products),
    'total_orders',    (select count(*) from public.orders),
    'total_customers', (select count(*) from public.profiles where role = 'customer'),
    'pending_orders',  (select count(*) from public.orders where status = 'pending'),
    'revenue',         (select coalesce(sum(total_amount), 0) from public.orders
                        where status in ('paid', 'processing', 'shipped', 'delivered'))
  );
end;
$$;

revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Customer list (emails live in auth.users, which PostgREST can't expose)
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_customers()
returns table (
  id          uuid,
  email       text,
  full_name   text,
  phone       text,
  role        text,
  created_at  timestamptz,
  order_count bigint,
  total_spent numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  select p.id,
         u.email::text,
         p.full_name,
         p.phone,
         p.role,
         p.created_at,
         count(o.id),
         coalesce(sum(o.total_amount) filter
           (where o.status in ('paid', 'processing', 'shipped', 'delivered')), 0)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.orders o on o.user_id = p.id
  group by p.id, u.email, p.full_name, p.phone, p.role, p.created_at
  order by p.created_at desc
  limit 500;
end;
$$;

revoke execute on function public.admin_list_customers() from public, anon;
grant execute on function public.admin_list_customers() to authenticated;

-- ---------------------------------------------------------------------------
-- Change an order's status
--   Forward flow: pending -> paid -> processing -> shipped -> delivered (no going back).
--   Cancel: only before shipping; returns the items to stock.
--   Refund: only once paid (not from pending). Does not restock (goods may be gone).
--   cancelled / refunded are final.
-- Errors (SQLSTATE P0001): invalid_status | order_not_found | order_closed | invalid_transition
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_order_status(p_order uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old  text;
  v_flow text[] := array['pending', 'paid', 'processing', 'shipped', 'delivered'];
begin
  if not (select public.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_status is null or p_status not in
     ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') then
    raise exception 'invalid_status' using errcode = 'P0001';
  end if;

  select status into v_old from public.orders where id = p_order for update;
  if not found then
    raise exception 'order_not_found' using errcode = 'P0001';
  end if;

  if v_old = p_status then
    return;
  end if;
  if v_old in ('cancelled', 'refunded') then
    raise exception 'order_closed' using errcode = 'P0001';
  end if;

  if p_status = 'cancelled' then
    if v_old in ('shipped', 'delivered') then
      raise exception 'invalid_transition' using errcode = 'P0001';
    end if;
    -- Lock products in id order (same as place_order) to avoid deadlocks, then restock.
    perform 1 from public.products
      where id in (select product_id from public.order_items where order_id = p_order)
      order by id for update;
    update public.products p
      set stock = p.stock + i.quantity
      from public.order_items i
      where i.order_id = p_order and i.product_id = p.id;
  elsif p_status = 'refunded' then
    if v_old = 'pending' then
      raise exception 'invalid_transition' using errcode = 'P0001';
    end if;
  elsif array_position(v_flow, p_status) < array_position(v_flow, v_old) then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  update public.orders set status = p_status where id = p_order;
end;
$$;

revoke execute on function public.admin_set_order_status(uuid, text) from public, anon;
grant execute on function public.admin_set_order_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Product images: public-read bucket, admin-only writes
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "product_images_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product_images_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Make yourself the first admin (run once, with your own email):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------------------------
