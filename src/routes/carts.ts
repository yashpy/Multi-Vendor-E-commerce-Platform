import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { ApiError } from '../middleware/errorHandler';
import { getCart, addItem, updateItem, removeItem } from '../services/cartService';

const router = Router();

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

router.get('/:userId', async (req, res, next) => {
  try {
    res.status(200).json(await getCart(req.params.userId));
  } catch (err) {
    next(err);
  }
});

router.post('/:userId/items', validateBody(addItemSchema), async (req, res, next) => {
  try {
    const cart = await addItem(req.params.userId, req.body);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

router.put('/:userId/items/:productId', validateBody(updateItemSchema), async (req, res, next) => {
  try {
    const cart = await updateItem(req.params.userId, req.params.productId, req.body.quantity);
    if (!cart) throw new ApiError(404, 'Cart item not found');
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
});

router.delete('/:userId/items/:productId', async (req, res, next) => {
  try {
    const cart = await removeItem(req.params.userId, req.params.productId);
    if (!cart) throw new ApiError(404, 'Cart not found');
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
});

export default router;
