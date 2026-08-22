import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { createVendor, listVendors, getVendorById } from '../services/vendorService';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

const createVendorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

router.post('/', validateBody(createVendorSchema), async (req, res, next) => {
  try {
    const vendor = await createVendor(req.body);
    res.status(201).json(vendor);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    res.status(200).json(await listVendors());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vendor = await getVendorById(req.params.id);
    if (!vendor) throw new ApiError(404, 'Vendor not found');
    res.status(200).json(vendor);
  } catch (err) {
    next(err);
  }
});

export default router;
