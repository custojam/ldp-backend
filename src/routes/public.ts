import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getFormBySlug } from '../services/formService';
import { submitLead } from '../services/leadService';

const router = Router();

// Get public form details by slug
router.get('/forms/:slug', param('slug').notEmpty(), async (req: Request, res: Response): Promise<void> => {
  try {
    const form = await getFormBySlug(req.params.slug);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    res.json({ id: form.id, name: form.name, slug: form.slug });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Submit a lead via public form
router.post(
  '/forms/:slug/submit',
  [
    param('slug').notEmpty(),
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().trim().withMessage('Phone is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // Capture visitor IP
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        '0.0.0.0';

      const lead = await submitLead({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        ipAddress,
        formSlug: req.params.slug,
      });

      res.status(201).json({
        message: 'Thank you! Your information has been submitted successfully.',
        status: lead.status,
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export default router;
