import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { ApiError } from '../middleware/errorHandler';
import { getTracking, setTracking } from '../services/trackingService';

const router = Router();

const updateTrackingSchema = z.object({
  status: z.enum(['created', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']),
  location: z.string().min(1),
});

router.get('/:orderId', async (req, res, next) => {
  try {
    const tracking = await getTracking(req.params.orderId);
    if (!tracking) throw new ApiError(404, 'Tracking not found');
    res.status(200).json(tracking);
  } catch (err) {
    next(err);
  }
});

router.put('/:orderId', validateBody(updateTrackingSchema), async (req, res, next) => {
  try {
    const tracking = await setTracking(req.params.orderId, req.body.status, req.body.location);
    res.status(200).json(tracking);
  } catch (err) {
    next(err);
  }
});

export default router;
