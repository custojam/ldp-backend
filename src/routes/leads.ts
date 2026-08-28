import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getAllLeads, getLeadById, manualAssignLead, getLeadStats } from '../services/leadService';

const router = Router();
router.use(requireAuth);

router.get('/', query('status').optional().isString(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const leads = await getAllLeads({ status: req.query!.status as string | undefined });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/stats', async (_req, res: Response): Promise<void> => {
  try {
    const stats = await getLeadStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:id', param('id').isInt(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  try {
    const lead = await getLeadById(Number(req.params!.id));
    if (!lead) { res.status(404).json({ error: 'Lead not found' }); return; }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post(
  '/:id/assign',
  [param('id').isInt(), body('brokerId').isInt().withMessage('Valid broker ID required')],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const lead = await manualAssignLead(Number(req.params!.id), req.body.brokerId);
      res.json(lead);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export default router;
