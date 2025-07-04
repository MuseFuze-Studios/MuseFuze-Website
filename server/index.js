import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import staffRoutes from './routes/staff.js';
import adminRoutes from './routes/admin.js';
import legalRoutes from './routes/legal.js';
import { initDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database
await initDatabase();

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    if (!origin && NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'https://musefuzestudios.com',
      'https://www.musefuzestudios.com',
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
    ].filter(Boolean);
    
    console.log(`CORS check - Origin: ${origin}, Environment: ${NODE_ENV}`);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      if (NODE_ENV === 'development') {
        console.log(`🔧 Development mode: allowing origin anyway`);
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-CSRF-Token',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', (req, res) => {
  console.log(`Preflight request from origin: ${req.get('Origin')}`);
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://images.pexels.com", "https://via.placeholder.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: NODE_ENV === 'production' ? 50 : 500,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 1 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In production, serve the built frontend
if (NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  console.log(`📁 Serving static files from: ${publicPath}`);
}

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.get('Origin') || 'no-origin';
  
  if (NODE_ENV === 'development') {
    console.log(`${timestamp} - ${req.method} ${req.path} - Origin: ${origin}`);
  } else {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) {
      console.log(`${timestamp} - ${req.method} ${req.path} - Origin: ${origin} - IP: ${req.ip}`);
    }
  }
  
  next();
});

// Add security headers for all responses
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  next();
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/legal', legalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    cors: 'enabled',
    version: '1.0.0',
    uptime: process.uptime(),
    domain: req.get('Host'),
    origin: req.get('Origin')
  });
});

// CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.get('Origin'),
    host: req.get('Host'),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    headers: {
      'access-control-allow-origin': res.get('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.get('Access-Control-Allow-Credentials')
    }
  });
});

// Add missing endpoints directly here until routes are created

// Announcements
app.get('/api/announcements', (req, res) => {
  res.json(mockData.announcements);
});

// Redirect old build upload endpoint to new staff endpoint
app.post('/api/builds/upload', (req, res) => {
  res.status(301).json({ 
    error: 'Endpoint moved', 
    message: 'Please use /api/staff/builds/upload instead',
    redirect: '/api/staff/builds/upload'
  });
});

// Game builds endpoint
app.get('/api/builds', (req, res) => {
  res.json(mockData.builds);
});

// Bug Reports
app.get('/api/bugs', (req, res) => {
  res.json(mockData.bugs);
});

// Finance endpoints
app.get('/api/staff/finance/transactions', (req, res) => {
  // Return mock transactions with proper structure
  const mockTransactions = [
    {
      id: 1,
      type: 'income',
      category: 'Investment Funding',
      amount: 10000,
      currency: 'GBP',
      vat_rate: 0,
      vat_amount: 0,
      description: 'Initial seed funding',
      justification: 'Startup capital for development',
      responsible_staff: 'Admin User',
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
      hmrc_category: 'Investment Income'
    },
    {
      id: 2,
      type: 'expense',
      category: 'Software Licenses',
      amount: 500,
      currency: 'GBP',
      vat_rate: 20,
      vat_amount: 100,
      description: 'Unity Pro licenses',
      justification: 'Required for game development',
      responsible_staff: 'Admin User',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      status: 'approved',
      hmrc_category: 'Software and subscriptions'
    }
  ];
  res.json(mockTransactions);
});

app.post('/api/staff/finance/transactions', (req, res) => {
  console.log('Creating transaction:', req.body);
  
  const amount = parseFloat(req.body.amount) || 0;
  const vatRate = parseFloat(req.body.vat_rate) || 0;
  const vatAmount = (amount * vatRate) / 100;
  
  const transaction = {
    id: Date.now(),
    ...req.body,
    amount: amount,
    vat_rate: vatRate,
    vat_amount: vatAmount,
    currency: 'GBP',
    responsible_staff: 'Current User',
    date: new Date().toISOString(),
    status: 'approved'
  };
  
  console.log('Created transaction:', transaction);
  res.status(201).json(transaction);
});

app.get('/api/staff/finance/budgets', (req, res) => {
  // Return mock budgets
  const mockBudgets = [
    {
      id: 1,
      category: 'Software Licenses',
      allocated: 2000,
      spent: 500,
      currency: 'GBP',
      period: 'monthly',
      fiscal_year: new Date().getFullYear(),
      last_updated: new Date().toISOString()
    },
    {
      id: 2,
      category: 'Marketing & Advertising',
      allocated: 1500,
      spent: 0,
      currency: 'GBP',
      period: 'monthly',
      fiscal_year: new Date().getFullYear(),
      last_updated: new Date().toISOString()
    }
  ];
  res.json(mockBudgets);
});

app.post('/api/staff/finance/budgets', (req, res) => {
  console.log('Creating budget:', req.body);
  
  const budget = {
    id: Date.now(),
    ...req.body,
    allocated: parseFloat(req.body.allocated) || 0,
    spent: 0,
    currency: 'GBP',
    fiscal_year: new Date().getFullYear(),
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString()
  };
  
  console.log('Created budget:', budget);
  res.status(201).json(budget);
});

app.get('/api/staff/finance/forecasts', (req, res) => {
  res.json([
    { month: 'January', estimated: 5000, actual: 4800, currency: 'GBP', fiscal_year: new Date().getFullYear() },
    { month: 'February', estimated: 5500, actual: 5200, currency: 'GBP', fiscal_year: new Date().getFullYear() },
    { month: 'March', estimated: 6000, actual: 0, currency: 'GBP', fiscal_year: new Date().getFullYear() },
    { month: 'April', estimated: 6200, actual: 0, currency: 'GBP', fiscal_year: new Date().getFullYear() }
  ]);
});

// Tax report generation endpoint
app.post('/api/staff/finance/tax-report', (req, res) => {
  console.log('Generating tax report:', req.body);
  
  const { report_type, period_start, period_end } = req.body;
  
  const mockReport = {
    id: Date.now(),
    report_type,
    period_start,
    period_end,
    total_income: 25000,
    total_expenses: 15000,
    total_vat: 2000,
    net_profit: 10000,
    status: 'draft',
    generated_at: new Date().toISOString()
  };
  
  console.log('Generated tax report:', mockReport);
  res.json(mockReport);
});

// In production, serve the React app for all non-API routes
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        error: 'API route not found',
        path: req.originalUrl,
        method: req.method
      });
    }
    
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    res.sendFile(indexPath);
  });
} else {
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method
    });
  });
}

// Error handling
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MuseFuze Server running on port ${PORT}`);
  console.log(`🔒 Environment: ${NODE_ENV}`);
  console.log(`⚡ Rate limiting: ${NODE_ENV === 'production' ? 'STRICT' : 'RELAXED'}`);
  console.log(`🌐 CORS enabled for ${NODE_ENV} environment`);
  console.log(`📡 Server accessible at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  if (NODE_ENV === 'production') {
    console.log(`🌍 Frontend served from: http://localhost:${PORT}`);
    console.log(`🔗 API accessible at: http://localhost:${PORT}/api/`);
  } else {
    console.log(`🧪 CORS test: http://localhost:${PORT}/api/test-cors`);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

export default app;