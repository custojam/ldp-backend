import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import brokerRoutes from './routes/brokers';
import formRoutes from './routes/forms';
import distributionRoutes from './routes/distributions';
import leadRoutes from './routes/leads';
import publicRoutes from './routes/public';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
app.use('/api/public', publicRoutes);

// Admin API routes (auth required)
app.use('/api/auth', authRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/leads', leadRoutes);

app.use(errorHandler);

const PORT = process.env.BACKEND_PRIVATE_PORT || process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[Server] Backend running on port ${PORT}`);
});

export default app;
