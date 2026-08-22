import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import vendorsRouter from './routes/vendors';
import productsRouter from './routes/products';
import cartsRouter from './routes/carts';
import ordersRouter from './routes/orders';
import userOrdersRouter from './routes/userOrders';
import trackingRouter from './routes/tracking';
import storageRouter from './routes/storage';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api/vendors', vendorsRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/carts', cartsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/users', userOrdersRouter);
  app.use('/api/tracking', trackingRouter);
  app.use('/api/storage', storageRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
