import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { InsufficientInventoryError, ProductNotFoundError } from '../services/orderService';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation error', details: err.errors });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof ProductNotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof InsufficientInventoryError) {
    return res.status(409).json({ error: err.message });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
