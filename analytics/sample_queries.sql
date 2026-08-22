-- Example ad-hoc queries against the analytics views/tables.

-- Top 5 vendors by revenue
SELECT * FROM `ecommerce_analytics.vendor_revenue`
ORDER BY revenue DESC
LIMIT 5;

-- Sales trend for the last 30 days
SELECT * FROM `ecommerce_analytics.sales_trends`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
ORDER BY date;

-- Overall repeat customer rate
SELECT * FROM `ecommerce_analytics.customer_retention`;

-- Best-selling products
SELECT * FROM `ecommerce_analytics.product_performance`
ORDER BY units_sold DESC
LIMIT 10;
