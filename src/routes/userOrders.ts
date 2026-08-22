import { Router } from 'express';
import { getOrdersByUser } from '../services/orderService';

const router = Router();

router.get('/:userId/orders', async (req, res, next) => {
  try {
    res.status(200).json(await getOrdersByUser(req.params.userId));
  } catch (err) {
    next(err);
  }
});

export default router;
