import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  getAllBrokers,
  getBrokerById,
  createBroker,
  updateBroker,
  deleteBroker,
} from '../services/brokerService';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const brokers = await getAllBrokers();
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:id', param('id').isInt(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  try {
    const broker = await getBrokerById(Number(req.params!.id));
    if (!broker) { res.status(404).json({ error: 'Broker not found' }); return; }
    res.json(broker);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Broker name required'),
    body('dailyCap').optional().isInt({ min: 1 }).withMessage('Daily cap must be positive integer'),
    body('timezone').optional().isString(),
    body('openingTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('Opening time format HH:MM'),
    body('closingTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('Closing time format HH:MM'),
    body('workingDays').optional().isArray().withMessage('Working days must be array'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const broker = await createBroker(req.body);
      res.status(201).json(broker);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').optional().notEmpty().trim(),
    body('dailyCap').optional().isInt({ min: 1 }),
    body('openingTime').optional().matches(/^\d{2}:\d{2}$/),
    body('closingTime').optional().matches(/^\d{2}:\d{2}$/),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const broker = await updateBroker(Number(req.params!.id), req.body);
      res.json(broker);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

router.delete('/:id', param('id').isInt(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  try {
    await deleteBroker(Number(req.params!.id));
    res.json({ message: 'Broker deleted' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
