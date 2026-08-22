import { v4 as uuid } from 'uuid';
import { pool } from '../db/pool';
import { Product } from '../types';
import { analyticsPublisher } from './analyticsPublisher';

export async function createProduct(input: {
  vendor_id: string;
  name: string;
  description?: string;
  price_cents: number;
  inventory: number;
}): Promise<Product> {
  const id = uuid();
  const result = await pool.query(
    `INSERT INTO products (id, vendor_id, name, description, price_cents, inventory, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     RETURNING *`,
    [id, input.vendor_id, input.name, input.description || null, input.price_cents, input.inventory]
  );
  const product = result.rows[0];

  await analyticsPublisher.publish({
    type: 'product_event',
    payload: {
      product_id: product.id,
      vendor_id: product.vendor_id,
      event_type: 'created',
      timestamp: new Date().toISOString(),
    },
  });

  return product;
}

export async function listProducts(): Promise<Product[]> {
  const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  return result.rows;
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function updateProduct(
  id: string,
  input: Partial<{ name: string; description: string; price_cents: number; inventory: number }>
): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const result = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price_cents = $3, inventory = $4
     WHERE id = $5
     RETURNING *`,
    [
      input.name ?? existing.name,
      input.description ?? existing.description,
      input.price_cents ?? existing.price_cents,
      input.inventory ?? existing.inventory,
      id,
    ]
  );
  return result.rows[0];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
