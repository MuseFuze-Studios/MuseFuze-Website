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

// Mock data storage (since we don't have database yet)
let mockData = {
  announcements: [
    {
      id: 1,
      title: 'Welcome to the Staff Dashboard',
      content: 'This is your central hub for development collaboration. Use the various tools to report bugs, submit reviews, and coordinate testing sessions.',
      author_name: 'Admin User',
      is_sticky: true,
      target_roles: ['all'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  bugs: [],
  builds: [
    {
      id: 1,
      version: '0.1.0',
      title: 'Alpha Build - Initial Release',
      description: 'First playable build with basic mechanics',
      file_size: 1024 * 1024 * 50, // 50MB
      upload_date: new Date().toISOString(),
      test_instructions: 'Test basic movement and interaction systems',
      known_issues: 'Some UI elements may not scale properly on different resolutions',
      uploaded_by_name: 'Admin User'
    }
  ],
  reviews: [],
  messages: [],
  playtestSessions: [],
  downloadHistory: [],
  transactions: [],
  budgets: [],
  forecasts: [
    { month: 'January', estimated: 5000, actual: 4800 },
    { month: 'February', estimated: 5500, actual: 5200 },
    { month: 'March', estimated: 6000, actual: 0 }
  ],
  teamMembers: [
    { id: 1, username: 'Admin User', role: 'admin' },
    { id: 2, username: 'Staff Member', role: 'staff' },
    { id: 3, username: 'Developer', role: 'developer' }
  ]
};

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

// Add missing endpoints directly here until routes are created

// Announcements
app.get('/api/announcements', (req, res) => {
  res.json(mockData.announcements);
});

// Bug Reports
app.get('/api/bugs', (req, res) => {
  res.json(mockData.bugs);
});

app.post('/api/bugs', (req, res) => {
  const bug = {
    id: mockData.bugs.length + 1,
    ...req.body,
    reported_by: 1,
    reporter_name: 'Current User',
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockData.bugs.push(bug);
  res.status(201).json(bug);
});

app.get('/api/bugs/team-members', (req, res) => {
  res.json(mockData.teamMembers);
});

// Reviews
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