import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { ApiError } from '../middleware/errorHandler';
import {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../services/productService';

const router = Router();

const createProductSchema = z.object({
  vendor_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().nonnegative(),
  inventory: z.number().int().nonnegative(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price_cents: z.number().int().nonnegative().optional(),
  inventory: z.number().int().nonnegative().optional(),
});

router.post('/', validateBody(createProductSchema), async (req, res, next) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    res.status(200).json(await listProducts());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validateBody(updateProductSchema), async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) throw new ApiError(404, 'Product not found');
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) throw new ApiError(404, 'Product not found');
    res.status(200).json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
