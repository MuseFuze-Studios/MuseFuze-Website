const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_long_and_random';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'musefuze_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool
let pool;
try {
  pool = mysql.createPool(DB_CONFIG);
  console.log('📊 Database connection pool created');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  // Continue without database for development
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/builds';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.rar', '.7z', '.exe'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only ZIP, RAR, 7Z, and EXE files are allowed.'));
    }
  }
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // In a real app, you'd fetch user from database
    // For now, we'll use mock data
    req.user = {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Mock data storage (in production, this would be in a database)
let mockData = {
  users: [
    {
      id: 1,
      email: 'admin@musefuze.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/HK', // password123
      createdAt: new Date().toISOString(),
      cookiesAccepted: true
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
  messages: [],
  playtestSessions: [],
  downloadHistory: [],
  transactions: [],
  budgets: [],
  forecasts: [
    { month: 'January', estimated: 5000, actual: 4800 },
    { month: 'February', estimated: 5500, actual: 5200 },
    { month: 'March', estimated: 6000, actual: 0 }
  ]
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth endpoints
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { email, password } = req.body;
    
    // Find user (in production, this would be a database query)
    const user = mockData.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Staff endpoints
app.get('/api/announcements', authenticateToken, (req, res) => {
  res.json(mockData.announcements);
});

app.get('/api/bugs', authenticateToken, (req, res) => {
  res.json(mockData.bugs);
});

app.post('/api/bugs', authenticateToken, [
  body('title').isLength({ min: 1, max: 200 }),
  body('description').isLength({ min: 1, max: 2000 }),
  body('priority').isIn(['low', 'medium', 'high', 'critical'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const bug = {
      id: mockData.bugs.length + 1,
      ...req.body,
      reported_by: req.user.id,
      reporter_name: `${req.user.firstName} ${req.user.lastName}`,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockData.bugs.push(bug);
    res.status(201).json(bug);
  } catch (error) {
    console.error('Create bug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bugs/team-members', authenticateToken, (req, res) => {
  const teamMembers = mockData.users
    .filter(user => ['dev_tester', 'developer', 'staff', 'admin', 'ceo'].includes(user.role))
    .map(user => ({
      id: user.id,
      username: `${user.firstName} ${user.lastName}`,
      role: user.role
    }));
  
  res.json(teamMembers);
});

app.get('/api/staff/builds', authenticateToken, (req, res) => {
  res.json({ builds: mockData.builds });
});

app.get('/api/reviews/build/:buildId', authenticateToken, (req, res) => {
  const buildId = parseInt(req.params.buildId);
  const buildReviews = mockData.reviews.filter(r => r.build_id === buildId);
  res.json(buildReviews);
});

app.post('/api/reviews', authenticateToken, [
  body('build_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').isLength({ min: 1, max: 1000 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const review = {
      id: mockData.reviews.length + 1,
      ...req.body,
      reviewer_id: req.user.id,
      reviewer_name: `${req.user.firstName} ${req.user.lastName}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockData.reviews.push(review);
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/staff/messages', authenticateToken, (req, res) => {
  const posts = mockData.messages.filter(m => !m.parentId);
  const postsWithReplyCounts = posts.map(post => ({
    ...post,
    replyCount: mockData.messages.filter(m => m.parentId === post.id).length
  }));
  res.json({ posts: postsWithReplyCounts });
});

app.post('/api/staff/messages', authenticateToken, [
  body('title').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 1, max: 2000 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const message = {
      id: mockData.messages.length + 1,
      ...req.body,
      authorId: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false
    };

    mockData.messages.push(message);
    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/playtest/sessions', authenticateToken, (req, res) => {
  res.json(mockData.playtestSessions);
});

app.get('/api/builds/downloads', authenticateToken, (req, res) => {
  res.json(mockData.downloadHistory);
});

// Finance endpoints (admin only)
app.get('/api/admin/finance/transactions', authenticateToken, requireRole(['admin', 'ceo']), (req, res) => {
  res.json(mockData.transactions);
});

app.post('/api/admin/finance/transactions', authenticateToken, requireRole(['admin', 'ceo']), [
  body('type').isIn(['income', 'expense']),
  body('category').isLength({ min: 1, max: 100 }),
  body('amount').isFloat({ min: 0 }),
  body('description').isLength({ min: 1, max: 200 }),
  body('justification').isLength({ min: 1, max: 500 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const transaction = {
      id: mockData.transactions.length + 1,
      ...req.body,
      responsible_staff: `${req.user.firstName} ${req.user.lastName}`,
      date: new Date().toISOString(),
      status: 'approved'
    };

    mockData.transactions.push(transaction);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/finance/budgets', authenticateToken, requireRole(['admin', 'ceo']), (req, res) => {
  res.json(mockData.budgets);
});

app.post('/api/admin/finance/budgets', authenticateToken, requireRole(['admin', 'ceo']), [
  body('category').isLength({ min: 1, max: 100 }),
  body('allocated').isFloat({ min: 0 }),
  body('period').isIn(['monthly', 'quarterly', 'yearly'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const budget = {
      id: mockData.budgets.length + 1,
      ...req.body,
      spent: 0,
      last_updated: new Date().toISOString()
    };

    mockData.budgets.push(budget);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/finance/forecasts', authenticateToken, requireRole(['admin', 'ceo']), (req, res) => {
  res.json(mockData.forecasts);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 500MB.' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection
  if (pool) {
    pool.getConnection()
      .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
      })
      .catch(error => {
        console.log('⚠️  Database connection failed, using mock data:', error.message);
      });
  }
});

module.exports = app;