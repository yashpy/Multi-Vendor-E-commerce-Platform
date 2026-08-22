# Connecting Looker Studio to BigQuery

This document explains how to connect Looker Studio to the
`ecommerce_analytics` BigQuery dataset created by `analytics/schema.sql`
and `analytics/views.sql`. No Looker Studio dashboard URL is created by
this repository - dashboards must be built manually following the steps
below.

## 1. Prerequisites

- The BigQuery dataset `ecommerce_analytics` exists in your GCP project.
- The views in `analytics/views.sql` have been created.
- Your Google account has BigQuery Data Viewer + Job User roles on the
  project.

## 2. Connect Looker Studio to BigQuery

1. Go to https://lookerstudio.google.com and create a new report.
2. Choose **BigQuery** as the connector.
3. Select **My Projects**, then your GCP project.
4. Select the `ecommerce_analytics` dataset.
5. Add one data source per view you want to chart:
   - `vendor_revenue`
   - `sales_trends`
   - `customer_retention`
   - `product_performance`
   - `orders` (raw table, for ad-hoc filtering)

## 3. Recommended dashboard sections

| Section              | Suggested chart          | Data source            |
|-----------------------|--------------------------|-------------------------|
| Sales trends          | Time series              | `sales_trends`          |
| Total revenue         | Scorecard                | `sales_trends` (SUM)    |
| Revenue by vendor      | Bar chart                 | `vendor_revenue`         |
| Orders                | Table                     | `orders`                 |
| Product performance   | Table / bar chart        | `product_performance`   |
| Customer retention    | Scorecard / pie chart    | `customer_retention`    |

## 4. Refresh behavior

BigQuery connectors in Looker Studio support both live connection (query
run on view/load) and extract (cached snapshot) modes. For near-real-time
dashboards, use live connection mode; for large datasets, consider extract
mode with a scheduled refresh.
