import { v4 as uuid } from 'uuid';
import { pool } from '../db/pool';
import { Vendor } from '../types';

export async function createVendor(input: { name: string; email: string }): Promise<Vendor> {
  const id = uuid();
  const result = await pool.query(
    `INSERT INTO vendors (id, name, email, verification_status, created_at)
     VALUES ($1, $2, $3, 'pending', now())
     RETURNING *`,
    [id, input.name, input.email]
  );
  return result.rows[0];
}

export async function listVendors(): Promise<Vendor[]> {
  const result = await pool.query('SELECT * FROM vendors ORDER BY created_at DESC');
  return result.rows;
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  const result = await pool.query('SELECT * FROM vendors WHERE id = $1', [id]);
  return result.rows[0] || null;
}
