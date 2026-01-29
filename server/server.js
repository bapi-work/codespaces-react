import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import autoInitializeDatabase from './scripts/setupDatabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Flag to track if database is initialized
let dbInitialized = false;

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management', {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Auto-initialize database if needed (on production/cloud deployment)
    if (process.env.AUTO_INIT_DB === 'true' || process.env.NODE_ENV === 'production') {
      console.log('🚀 Running automatic database initialization...');
      const initialized = await autoInitializeDatabase({ verbose: true });
      dbInitialized = initialized;
      
      if (initialized) {
        console.log('✨ Database initialization successful');
      } else {
        console.warn('⚠️  Database initialization encountered issues');
      }
    } else {
      dbInitialized = true;
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Import Routes
import authRoutes from './routes/auth.js';
import assetRoutes from './routes/assets.js';
import employeeRoutes from './routes/employees.js';
import assignmentRoutes from './routes/assignments.js';
import settingsRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';
import auditRoutes from './routes/audit.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
