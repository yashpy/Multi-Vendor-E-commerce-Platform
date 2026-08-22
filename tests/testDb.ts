import fs from 'fs';
import path from 'path';
import { pool } from '../src/db/pool';

/**
 * Applies migrations against the test database configured via
 * DATABASE_URL (see tests/setupEnv.ts). Requires a reachable PostgreSQL
 * instance, e.g. `docker compose up -d postgres`.
 */
export async function resetTestDatabase() {
  await pool.query('DROP TABLE IF EXISTS order_items, orders, products, vendors, users CASCADE');

  const dir = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await pool.query(sql);
  }
}

export async function seedUser(): Promise<string> {
  const result = await pool.query(
    `INSERT INTO users (name, email) VALUES ('Test User', 'test-user-' || gen_random_uuid() || '@example.com')
     RETURNING id`
  );
  return result.rows[0].id;
}
