import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { createSignedUploadUrl } from '../services/storageService';

const router = Router();

const uploadUrlSchema = z.object({
  kind: z.enum(['product-image', 'verification-document', 'invoice']),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

router.post('/upload-url', validateBody(uploadUrlSchema), async (req, res, next) => {
  try {
    const result = await createSignedUploadUrl(req.body.kind, req.body.fileName, req.body.contentType);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
