import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import registrationRoutes from './routes/registration.routes';
import abstractRoutes from './routes/abstract.routes';
import brochureRoutes from './routes/brochure.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin.routes';
import contentRoutes from './routes/content.routes';

import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/abstracts', abstractRoutes);
app.use('/api/brochure', brochureRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the con-27 Global Nursing Conference 2027 API Server',
    status: 'Running'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
