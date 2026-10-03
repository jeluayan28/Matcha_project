-- Sample catalog for development. Run in the Supabase SQL Editor.
-- Idempotent: re-running leaves existing rows untouched.
-- image_url is left null (the UI shows a placeholder). To add photos, upload them to a
-- public Storage bucket and set image_url to the public object URL.

insert into public.categories (name, slug, description) values
  ('Ceremonial', 'ceremonial', 'Stone-ground first-harvest matcha for drinking straight.'),
  ('Culinary',   'culinary',   'Bold, versatile matcha for lattes and baking.'),
  ('Accessories','accessories','Everything you need to whisk the perfect bowl.')
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, price, stock, is_featured)
select c.id, v.name, v.slug, v.description, v.price, v.stock, v.is_featured
from (values
  ('ceremonial',  'Uji Ceremonial Matcha', 'uji-ceremonial-matcha',
   'Vibrant, sweet and silky. First-harvest tencha from Uji, stone-ground in small batches and best whisked with hot water.', 32.00, 40, true),
  ('ceremonial',  'Morning Ritual Matcha', 'morning-ritual-matcha',
   'A smooth everyday ceremonial grade with gentle umami and no bitterness.', 26.00, 3, true),
  ('culinary',    'Latte Blend Matcha', 'latte-blend-matcha',
   'Bold enough to stand up to milk. Designed for lattes, smoothies and iced drinks.', 22.00, 75, true),
  ('culinary',    'Baker''s Matcha', 'bakers-matcha',
   'Deep green colour and robust flavour that survives the oven. Ideal for cookies, cakes and ice cream.', 18.00, 0, false),
  ('accessories', 'Bamboo Whisk (Chasen)', 'bamboo-whisk-chasen',
   'Hand-carved from a single piece of bamboo with 80 fine tines for a perfect froth.', 24.00, 25, true),
  ('accessories', 'Matcha Bowl (Chawan)', 'matcha-bowl-chawan',
   'A wide, stoneware bowl with room to whisk and a comfortable hold.', 38.00, 12, false)
) as v(category_slug, name, slug, description, price, stock, is_featured)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;
