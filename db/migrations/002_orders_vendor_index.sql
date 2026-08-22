-- Supports fast vendor-scoped order lookups via order_items join.
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
