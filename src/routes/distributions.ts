import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  getDistribution,
  getDistributionById,
  createDistribution,
  updateDistributionBroker,
  addBrokerToDistribution,
  removeBrokerFromDistribution,
} from '../services/distributionService';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const distribution = await getDistribution();
    res.json(distribution ?? null);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:id', param('id').isInt(), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  try {
    const distribution = await getDistributionById(Number(req.params!.id));
    if (!distribution) { res.status(404).json({ error: 'Distribution not found' }); return; }
    res.json(distribution);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Distribution name required'),
    body('brokers').isArray().withMessage('Brokers must be an array'),
    body('brokers.*.brokerId').isInt().withMessage('Each broker must have a valid brokerId'),
    body('brokers.*.percentage').isFloat({ min: 0, max: 100 }).withMessage('Percentage must be 0-100'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const { name, brokers } = req.body;
      const distribution = await createDistribution(name, brokers);
      res.status(201).json(distribution);
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('please create a form first') || message.includes('already exists')) {
        res.status(409).json({ error: message });
      } else {
        res.status(400).json({ error: message });
      }
    }
  }
);

router.put(
  '/:distributionId/brokers/:brokerId',
  [
    param('distributionId').isInt(),
    param('brokerId').isInt(),
    body('percentage').optional().isFloat({ min: 0, max: 100 }),
    body('isActive').optional().isBoolean(),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      await updateDistributionBroker(
        Number(req.params!.distributionId),
        Number(req.params!.brokerId),
        req.body
      );
      res.json({ message: 'Broker settings updated' });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

router.post(
  '/:distributionId/brokers',
  [
    param('distributionId').isInt(),
    body('brokerId').isInt(),
    body('percentage').isFloat({ min: 0, max: 100 }),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const result = await addBrokerToDistribution(
        Number(req.params!.distributionId),
        req.body.brokerId,
        req.body.percentage
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

router.delete(
  '/:distributionId/brokers/:brokerId',
  [param('distributionId').isInt(), param('brokerId').isInt()],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      await removeBrokerFromDistribution(
        Number(req.params!.distributionId),
        Number(req.params!.brokerId)
      );
      res.json({ message: 'Broker removed from distribution' });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export default router;
