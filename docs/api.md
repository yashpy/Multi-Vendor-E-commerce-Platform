# API Reference

Base URL (local): `http://localhost:8080`

## Vendors
- `POST /api/vendors` - `{ name, email }` -> 201
- `GET /api/vendors` -> 200
- `GET /api/vendors/:id` -> 200 | 404

## Products
- `POST /api/products` - `{ vendor_id, name, description?, price_cents, inventory }` -> 201
- `GET /api/products` -> 200
- `GET /api/products/:id` -> 200 | 404
- `PUT /api/products/:id` - partial update -> 200 | 404
- `DELETE /api/products/:id` -> 200 | 404

## Carts (Firestore)
- `GET /api/carts/:userId` -> 200
- `POST /api/carts/:userId/items` - `{ productId, quantity, unitPriceCents }` -> 201
- `PUT /api/carts/:userId/items/:productId` - `{ quantity }` -> 200 | 404
- `DELETE /api/carts/:userId/items/:productId` -> 200 | 404

## Orders (PostgreSQL, transactional)
- `POST /api/orders` - `{ user_id, items: [{ product_id, quantity }] }` -> 201 | 404 | 409
- `GET /api/orders/:id` -> 200 | 404
- `GET /api/users/:userId/orders` -> 200
- `PUT /api/orders/:id/status` - `{ status }` -> 200 | 404

## Tracking (Firestore)
- `GET /api/tracking/:orderId` -> 200 | 404
- `PUT /api/tracking/:orderId` - `{ status, location }` -> 200

## Storage (signed URLs)
- `POST /api/storage/upload-url` - `{ kind, fileName, contentType }` -> 201

### Example: create an order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","items":[{"product_id":"d1111111-1111-1111-1111-111111111111","quantity":1}]}'
```
