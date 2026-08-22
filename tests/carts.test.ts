import './mocks';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Carts API', () => {
  const userId = 'test-user-cart-1';
  const productId = '11111111-1111-1111-1111-111111111111';

  it('returns an empty cart for a new user', async () => {
    const res = await request(app).get(`/api/carts/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it('adds an item to the cart', async () => {
    const res = await request(app)
      .post(`/api/carts/${userId}/items`)
      .send({ productId, quantity: 2, unitPriceCents: 1500 });

    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('updates item quantity', async () => {
    const res = await request(app)
      .put(`/api/carts/${userId}/items/${productId}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it('removes an item from the cart', async () => {
    const res = await request(app).delete(`/api/carts/${userId}/items/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });
});
