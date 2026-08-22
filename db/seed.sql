-- Development seed data. No real personal information is used.

INSERT INTO users (id, name, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alex Rivera', 'alex.rivera@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'Sam Okafor', 'sam.okafor@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'Priya Nair', 'priya.nair@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO vendors (id, name, email, verification_status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Northwind Outfitters', 'contact@northwind.example.com', 'verified'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cascade Home Goods', 'hello@cascadehome.example.com', 'verified'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Solstice Electronics', 'sales@solstice.example.com', 'pending')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (id, vendor_id, name, description, price_cents, inventory) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Trail Backpack 30L', 'Durable daypack for hiking.', 8999, 120),
  ('d2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Insulated Water Bottle', '750ml stainless steel bottle.', 2499, 300),
  ('d3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ceramic Dinner Set (16pc)', 'Everyday stoneware dinnerware.', 6499, 60),
  ('d4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cotton Throw Blanket', 'Woven throw, 50x60in.', 3499, 90),
  ('d5555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Wireless Earbuds', 'Bluetooth 5.3 earbuds with case.', 5999, 200),
  ('d6666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'USB-C Fast Charger 65W', 'GaN compact charger.', 3999, 150)
ON CONFLICT (id) DO NOTHING;

-- Sample order: user 1 buys a backpack and a water bottle from Northwind.
INSERT INTO orders (id, user_id, status, total_cents) VALUES
  ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'delivered', 11498)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, vendor_id, quantity, unit_price_cents) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 8999),
  ('f2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 2499)
ON CONFLICT (id) DO NOTHING;
