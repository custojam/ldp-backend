import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { loginUser, getUserById } from '../services/authService';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      const result = await loginUser(email, password);

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('auth-token', result.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ user: result.user, token: result.token });
    } catch (err) {
      res.status(401).json({ error: (err as Error).message });
    }
  }
);

router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('auth-token');
  res.json({ message: 'Logged out successfully' });
});

router.get(
  '/me',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await getUserById(req.user.id);
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

export default router;
