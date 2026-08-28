import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getForm, createForm } from '../services/formService';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const form = await getForm();
    res.json(form ?? null);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Form name required'),
    body('slug')
      .notEmpty()
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must be lowercase letters, numbers, and hyphens only'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const form = await createForm(req.body.name, req.body.slug);
      res.status(201).json(form);
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('already exists')) {
        res.status(409).json({ error: message });
      } else {
        res.status(400).json({ error: message });
      }
    }
  }
);

export default router;
