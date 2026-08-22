-- BigQuery analytics views. Designed to be connected directly from Looker
-- Studio (see analytics/looker-studio.md).

-- Vendor revenue: orders and revenue per vendor.
CREATE OR REPLACE VIEW `ecommerce_analytics.vendor_revenue` AS
SELECT
  vendor_id,
  COUNT(DISTINCT order_id) AS order_count,
  SUM(quantity * unit_price_cents) / 100.0 AS revenue
FROM `ecommerce_analytics.order_items`
GROUP BY vendor_id;

-- Sales trends: daily order count and revenue.
CREATE OR REPLACE VIEW `ecommerce_analytics.sales_trends` AS
SELECT
  DATE(created_at) AS date,
  COUNT(DISTINCT order_id) AS order_count,
  SUM(total_cents) / 100.0 AS revenue
FROM `ecommerce_analytics.orders`
GROUP BY date
ORDER BY date;

-- Customer retention: repeat customers (users with more than one order).
CREATE OR REPLACE VIEW `ecommerce_analytics.customer_retention` AS
WITH order_counts AS (
  SELECT user_id, COUNT(*) AS orders_placed
  FROM `ecommerce_analytics.orders`
  GROUP BY user_id
)
SELECT
  COUNT(*) AS total_customers,
  COUNTIF(orders_placed > 1) AS repeat_customers,
  SAFE_DIVIDE(COUNTIF(orders_placed > 1), COUNT(*)) AS repeat_customer_rate
FROM order_counts;

-- Product performance: units sold and revenue per product.
CREATE OR REPLACE VIEW `ecommerce_analytics.product_performance` AS
SELECT
  product_id,
  SUM(quantity) AS units_sold,
  SUM(quantity * unit_price_cents) / 100.0 AS revenue
FROM `ecommerce_analytics.order_items`
GROUP BY product_id;
