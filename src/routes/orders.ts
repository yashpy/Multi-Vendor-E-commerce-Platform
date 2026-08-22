import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { ApiError } from '../middleware/errorHandler';
import { createOrder, getOrderById, getOrdersByUser, updateOrderStatus } from '../services/orderService';

const router = Router();

const createOrderSchema = z.object({
  user_id: z.string().uuid(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['created', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']),
});

router.post('/', validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const order = await createOrder(req.body.user_id, req.body.items);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) throw new ApiError(404, 'Order not found');
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', validateBody(updateStatusSchema), async (req, res, next) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.status);
    if (!order) throw new ApiError(404, 'Order not found');
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
