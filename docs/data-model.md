# Data Model

## PostgreSQL (Cloud SQL) - transactional data

### users
| column     | type      | notes            |
|------------|-----------|------------------|
| id         | UUID PK   |                  |
| name       | TEXT      |                  |
| email      | TEXT      | UNIQUE           |
| created_at | TIMESTAMPTZ |                |

### vendors
| column               | type    | notes                                      |
|----------------------|---------|---------------------------------------------|
| id                   | UUID PK |                                             |
| name                 | TEXT    |                                             |
| email                | TEXT    | UNIQUE                                     |
| verification_status  | TEXT    | pending / verified / rejected               |
| created_at           | TIMESTAMPTZ |                                          |

### products
| column       | type    | notes                       |
|--------------|---------|------------------------------|
| id           | UUID PK |                              |
| vendor_id    | UUID FK | -> vendors.id, indexed        |
| name         | TEXT    |                              |
| description  | TEXT    | nullable                     |
| price_cents  | INTEGER | >= 0                          |
| inventory    | INTEGER | >= 0                          |
| created_at   | TIMESTAMPTZ |                          |

### orders
| column       | type    | notes                                  |
|--------------|---------|------------------------------------------|
| id           | UUID PK |                                          |
| user_id      | UUID FK | -> users.id, indexed                     |
| status       | TEXT    | created / processing / shipped / out_for_delivery / delivered / cancelled |
| total_cents  | INTEGER | >= 0                                      |
| created_at   | TIMESTAMPTZ | indexed                              |

### order_items
| column            | type    | notes                             |
|-------------------|---------|-------------------------------------|
| id                | UUID PK |                                     |
| order_id          | UUID FK | -> orders.id, indexed                |
| product_id        | UUID FK | -> products.id, indexed              |
| vendor_id         | UUID FK | -> vendors.id, indexed               |
| quantity          | INTEGER | > 0                                  |
| unit_price_cents  | INTEGER | >= 0 (price snapshot at order time)  |
| created_at        | TIMESTAMPTZ |                                  |

An order can contain items from multiple vendors; per-vendor revenue is
derived by joining `order_items` on `vendor_id` (see
`analytics/views.sql`).

## Firestore - live/operational data

- `carts/{userId}`: `{ userId, items: [{ productId, quantity, unitPriceCents }], updatedAt }`
- `order_tracking/{orderId}`: `{ orderId, status, location, timestamp }`

## BigQuery - analytics warehouse (`ecommerce_analytics`)

- `orders`, `order_items`, `product_events` (see `analytics/schema.sql`)
- Views: `vendor_revenue`, `sales_trends`, `customer_retention`,
  `product_performance` (see `analytics/views.sql`)
