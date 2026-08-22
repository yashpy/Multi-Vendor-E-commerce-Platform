-- BigQuery dataset & table DDL for the analytics warehouse.
-- Run with: bq query --use_legacy_sql=false < analytics/schema.sql
-- (replace `your-gcp-project` with your actual project id, or set it as the
-- default project via `gcloud config set project`)

CREATE SCHEMA IF NOT EXISTS `ecommerce_analytics`
OPTIONS (location = 'US');

CREATE TABLE IF NOT EXISTS `ecommerce_analytics.orders` (
  order_id STRING NOT NULL,
  user_id STRING NOT NULL,
  vendor_id STRING,
  status STRING NOT NULL,
  total_cents INT64 NOT NULL,
  created_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at);

CREATE TABLE IF NOT EXISTS `ecommerce_analytics.order_items` (
  order_id STRING NOT NULL,
  product_id STRING NOT NULL,
  vendor_id STRING NOT NULL,
  quantity INT64 NOT NULL,
  unit_price_cents INT64 NOT NULL,
  created_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at);

CREATE TABLE IF NOT EXISTS `ecommerce_analytics.product_events` (
  product_id STRING NOT NULL,
  vendor_id STRING NOT NULL,
  event_type STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL
)
PARTITION BY DATE(timestamp);
