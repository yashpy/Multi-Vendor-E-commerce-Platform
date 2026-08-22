import './mocks';
import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/db/pool';
import { resetTestDatabase, seedUser } from './testDb';

const app = createApp();

describe('Orders API', () => {
  let vendorId: string;
  let productId: string;
  let userId: string;

  beforeAll(async () => {
    await resetTestDatabase();

    const vendorRes = await request(app)
      .post('/api/vendors')
      .send({ name: 'Order Vendor', email: 'order-vendor@example.com' });
    vendorId = vendorRes.body.id;

    const productRes = await request(app).post('/api/products').send({
      vendor_id: vendorId,
      name: 'Limited Stock Item',
      price_cents: 1000,
      inventory: 2,
    });
    productId = productRes.body.id;

    userId = await seedUser();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates an order and decrements inventory', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ user_id: userId, items: [{ product_id: productId, quantity: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.total_cents).toBe(1000);
    expect(res.body.status).toBe('created');

    const productRes = await request(app).get(`/api/products/${productId}`);
    expect(productRes.body.inventory).toBe(1);
  });

  it('rejects an order when inventory is insufficient', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ user_id: userId, items: [{ product_id: productId, quantity: 999 }] });

    expect(res.status).toBe(409);

    // Inventory must remain unchanged after the rolled-back transaction.
    const productRes = await request(app).get(`/api/products/${productId}`);
    expect(productRes.body.inventory).toBe(1);
  });

  it('returns 404 when ordering a non-existent product', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ user_id: userId, items: [{ product_id: '00000000-0000-0000-0000-000000000000', quantity: 1 }] });

    expect(res.status).toBe(404);
  });

  it('updates order status', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .send({ user_id: userId, items: [{ product_id: productId, quantity: 1 }] });

    const statusRes = await request(app)
      .put(`/api/orders/${createRes.body.id}/status`)
      .send({ status: 'shipped' });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('shipped');
  });

  it('lists orders for a user', async () => {
    const res = await request(app).get(`/api/users/${userId}/orders`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
