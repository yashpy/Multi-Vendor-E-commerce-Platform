import './mocks';
import { createApp } from '../src/app';
import request from 'supertest';
import { pool } from '../src/db/pool';
import { resetTestDatabase } from './testDb';

const app = createApp();

describe('Products API', () => {
  let vendorId: string;

  beforeAll(async () => {
    await resetTestDatabase();
    const vendorRes = await request(app)
      .post('/api/vendors')
      .send({ name: 'Test Vendor', email: 'vendor@example.com' });
    vendorId = vendorRes.body.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates a product', async () => {
    const res = await request(app).post('/api/products').send({
      vendor_id: vendorId,
      name: 'Test Widget',
      price_cents: 1999,
      inventory: 10,
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Widget');
    expect(res.body.inventory).toBe(10);
  });

  it('rejects invalid product payloads', async () => {
    const res = await request(app).post('/api/products').send({
      vendor_id: vendorId,
      name: '',
      price_cents: -5,
      inventory: 10,
    });

    expect(res.status).toBe(400);
  });

  it('retrieves a product by id', async () => {
    const createRes = await request(app).post('/api/products').send({
      vendor_id: vendorId,
      name: 'Fetchable Widget',
      price_cents: 500,
      inventory: 3,
    });

    const getRes = await request(app).get(`/api/products/${createRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('Fetchable Widget');
  });

  it('returns 404 for a missing product', async () => {
    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});
