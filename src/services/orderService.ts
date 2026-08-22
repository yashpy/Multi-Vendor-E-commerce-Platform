import { v4 as uuid } from 'uuid';
import { PoolClient } from 'pg';
import { pool, withTransaction } from '../db/pool';
import { Order, OrderItemInput, OrderStatus } from '../types';
import { analyticsPublisher } from './analyticsPublisher';
import { setTracking } from './trackingService';

export class InsufficientInventoryError extends Error {
  constructor(productId: string) {
    super(`Insufficient inventory for product ${productId}`);
    this.name = 'InsufficientInventoryError';
  }
}

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}

/**
 * Creates an order inside a single PostgreSQL transaction:
 *  1. Validate products exist.
 *  2. Lock inventory rows (SELECT ... FOR UPDATE).
 *  3. Verify sufficient inventory.
 *  4. Calculate total.
 *  5. Decrement inventory.
 *  6. Create order.
 *  7. Create order items.
 *  8. Commit (handled by withTransaction).
 *  9. Publish analytics/order event.
 * 10. Update Firestore order tracking.
 *
 * Any failure rolls back the entire transaction.
 */
export async function createOrder(userId: string, items: OrderItemInput[]): Promise<Order> {
  if (!items.length) {
    throw new Error('Order must contain at least one item');
  }

  const order = await withTransaction(async (client: PoolClient) => {
    const productIds = items.map((i) => i.product_id);

    // Lock the relevant product rows for update to prevent oversell races.
    const lockResult = await client.query(
      `SELECT id, vendor_id, price_cents, inventory
       FROM products
       WHERE id = ANY($1::uuid[])
       FOR UPDATE`,
      [productIds]
    );

    const productsById = new Map(lockResult.rows.map((row) => [row.id, row]));

    for (const item of items) {
      const product = productsById.get(item.product_id);
      if (!product) {
        throw new ProductNotFoundError(item.product_id);
      }
      if (product.inventory < item.quantity) {
        throw new InsufficientInventoryError(item.product_id);
      }
    }

    let totalCents = 0;
    for (const item of items) {
      const product = productsById.get(item.product_id)!;
      totalCents += product.price_cents * item.quantity;
    }

    for (const item of items) {
      await client.query(
        `UPDATE products SET inventory = inventory - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    const orderId = uuid();
    const orderResult = await client.query(
      `INSERT INTO orders (id, user_id, status, total_cents, created_at)
       VALUES ($1, $2, 'created', $3, now())
       RETURNING *`,
      [orderId, userId, totalCents]
    );

    for (const item of items) {
      const product = productsById.get(item.product_id)!;
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, vendor_id, quantity, unit_price_cents, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())`,
        [uuid(), orderId, item.product_id, product.vendor_id, item.quantity, product.price_cents]
      );
    }

    return orderResult.rows[0] as Order;
  });

  // Steps 9-10 run after commit; failures here do not roll back the order,
  // they are best-effort downstream side effects.
  await analyticsPublisher.publish({
    type: 'order_created',
    payload: {
      order_id: order.id,
      user_id: order.user_id,
      status: order.status,
      total_cents: order.total_cents,
      created_at: order.created_at,
    },
  });

  await setTracking(order.id, 'created', 'Order placed');

  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const result = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const result = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  const order = result.rows[0];
  if (!order) return null;

  await analyticsPublisher.publish({
    type: 'order_status_changed',
    payload: { order_id: order.id, status, timestamp: new Date().toISOString() },
  });

  await setTracking(order.id, status, `Status updated to ${status}`);

  return order;
}
