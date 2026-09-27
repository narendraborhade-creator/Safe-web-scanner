import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import scanRoutes from './routes/scan';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// API Documentation / Welcome route at root
app.get('/', (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    name: 'SafeWeb Inspector & Comparator Backend API',
    version: '1.0.0',
    status: 'online',
    database: {
      type: 'MongoDB',
      status: dbStatusMap[dbState] || 'unknown',
    },
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      currentUser: 'GET /api/auth/me',
      checkSite: 'POST /api/scan/check-site',
      compareSites: 'POST /api/scan/compare-sites',
      scanHistory: 'GET /api/scan/history',
      samples: 'GET /api/scan/samples',
    },
    frontendUrl: 'http://localhost:5173'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
