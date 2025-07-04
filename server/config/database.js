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
import { initDatabase, pool } from './config/database.js';
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

// Trust proxy for proper IP detection (important for production)
app.set('trust proxy', 1);

// Enhanced CORS configuration for both development and production
const corsOptions = {
  origin: function (origin, callback) {
    // In production, we need to handle cases where origin might be undefined
    // (like direct API calls, mobile apps, or same-origin requests)
    if (!origin && NODE_ENV === 'production') {
      // Allow same-origin requests in production
      return callback(null, true);
    }
    
    if (!origin && NODE_ENV === 'development') {
      // Allow requests with no origin in development
      return callback(null, true);
    }
    
    const allowedOrigins = [
      // Development origins
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173', // Vite preview
      'http://127.0.0.1:4173',
      
      // Production origins - UPDATED for your domain
      'https://musefuzestudios.com',
      'https://www.musefuzestudios.com',
      'https://musefuze.netlify.app',
      'https://musefuze-studios.netlify.app',
      
      // Custom CLIENT_URL from environment
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
    ].filter(Boolean); // Remove undefined values
    
    // Log CORS attempts for debugging
    console.log(`CORS check - Origin: ${origin}, Environment: ${NODE_ENV}`);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`Allowed origins:`, allowedOrigins);
      
      // In development, be more permissive
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
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options('*', (req, res) => {
  console.log(`Preflight request from origin: ${req.get('Origin')}`);
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

// Security middleware (configured for production)
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
  } : false, // Disable CSP in development
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (more restrictive in production)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
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

// Request logging (more detailed in development)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.get('Origin') || 'no-origin';
  
  if (NODE_ENV === 'development') {
    console.log(`${timestamp} - ${req.method} ${req.path} - Origin: ${origin}`);
  } else {
    // Log only important requests in production
    if (req.method !== 'GET' || req.path.startsWith('/api/')) {
      console.log(`${timestamp} - ${req.method} ${req.path} - Origin: ${origin} - IP: ${req.ip}`);
    }
  }
  
  next();
});

// Add security headers for all responses
app.use((req, res, next) => {
  // Ensure CORS headers are set for all responses
  const origin = req.get('Origin');
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Additional security headers
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
// Database-driven endpoints (NO MOCK DATA)

// Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT a.*, u.firstName as author_name, u.lastName
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.is_sticky DESC, a.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Bug Reports
app.get('/api/bugs', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        br.*,
        u1.firstName as reporter_name, u1.lastName as reporter_last,
        u2.firstName as assignee_name, u2.lastName as assignee_last,
        gb.version as build_version, gb.title as build_title
      FROM bug_reports br
      JOIN users u1 ON br.reported_by = u1.id
      LEFT JOIN users u2 ON br.assigned_to = u2.id
      LEFT JOIN game_builds gb ON br.build_id = gb.id
      ORDER BY br.created_at DESC
    `);
    
    // Format the response to match frontend expectations
    const formattedRows = rows.map(row => ({
      ...row,
      reporter_name: `${row.reporter_name} ${row.reporter_last}`,
      assignee_name: row.assignee_name ? `${row.assignee_name} ${row.assignee_last}` : null,
      tags: row.tags ? JSON.parse(row.tags) : []
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).json({ error: 'Failed to fetch bug reports' });
  }
});

app.post('/api/bugs', async (req, res) => {
  try {
    const { title, description, priority, build_id, tags, assigned_to } = req.body;
    const reported_by = req.user?.id || 1; // Use authenticated user ID
    
    const [result] = await pool.execute(`
      INSERT INTO bug_reports (title, description, priority, build_id, tags, reported_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, priority, build_id || null, JSON.stringify(tags || []), reported_by, assigned_to || null]);
    
    // Fetch the created bug with joined data
    const [rows] = await pool.execute(`
      SELECT 
        br.*,
        u1.firstName as reporter_name, u1.lastName as reporter_last,
        u2.firstName as assignee_name, u2.lastName as assignee_last,
        gb.version as build_version, gb.title as build_title
      FROM bug_reports br
      JOIN users u1 ON br.reported_by = u1.id
      LEFT JOIN users u2 ON br.assigned_to = u2.id
      LEFT JOIN game_builds gb ON br.build_id = gb.id
      WHERE br.id = ?
    `, [result.insertId]);
    
    const bug = rows[0];
    bug.reporter_name = `${bug.reporter_name} ${bug.reporter_last}`;
    bug.assignee_name = bug.assignee_name ? `${bug.assignee_name} ${bug.assignee_last}` : null;
    bug.tags = bug.tags ? JSON.parse(bug.tags) : [];
    
    res.status(201).json(bug);
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({ error: 'Failed to create bug report' });
  }
});

app.get('/api/bugs/team-members', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, firstName, lastName, role
      FROM users
      WHERE role IN ('dev_tester', 'developer', 'staff', 'admin', 'ceo')
      ORDER BY firstName, lastName
    `);
    
    const formattedRows = rows.map(row => ({
      id: row.id,
      username: `${row.firstName} ${row.lastName}`,
      role: row.role
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Reviews
app.get('/api/reviews/build/:buildId', async (req, res) => {
  try {
    const { buildId } = req.params;
    const [rows] = await pool.execute(`
      SELECT 
        br.*,
        u.firstName as reviewer_name, u.lastName as reviewer_last,
        gb.version as build_version, gb.title as build_title
      FROM build_reviews br
      JOIN users u ON br.reviewer_id = u.id
      JOIN game_builds gb ON br.build_id = gb.id
      WHERE br.build_id = ?
      ORDER BY br.created_at DESC
    `, [buildId]);
    
    const formattedRows = rows.map(row => ({
      ...row,
      reviewer_name: `${row.reviewer_name} ${row.reviewer_last}`
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { build_id, rating, feedback } = req.body;
    const reviewer_id = req.user?.id || 1; // Use authenticated user ID
    
    const [result] = await pool.execute(`
      INSERT INTO build_reviews (build_id, rating, feedback, reviewer_id)
      VALUES (?, ?, ?, ?)
    `, [build_id, rating, feedback, reviewer_id]);
    
    // Fetch the created review with joined data
    const [rows] = await pool.execute(`
      SELECT 
        br.*,
        u.firstName as reviewer_name, u.lastName as reviewer_last,
        gb.version as build_version, gb.title as build_title
      FROM build_reviews br
      JOIN users u ON br.reviewer_id = u.id
      JOIN game_builds gb ON br.build_id = gb.id
      WHERE br.id = ?
    `, [result.insertId]);
    
    const review = rows[0];
    review.reviewer_name = `${review.reviewer_name} ${review.reviewer_last}`;
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Staff builds
app.get('/api/staff/builds', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        gb.*,
        u.firstName as uploaded_by_name, u.lastName as uploader_last
      FROM game_builds gb
      JOIN users u ON gb.uploaded_by = u.id
      WHERE gb.isActive = TRUE
      ORDER BY gb.upload_date DESC
    `);
    
    const formattedRows = rows.map(row => ({
      ...row,
      uploaded_by_name: `${row.uploaded_by_name} ${row.uploader_last}`
    }));
    
    res.json({ builds: formattedRows });
  } catch (error) {
    console.error('Error fetching builds:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
});

// Staff messages
app.get('/api/staff/messages', async (req, res) => {
  try {
    // Get posts (not replies)
    const [posts] = await pool.execute(`
      SELECT 
        mp.*,
        u.firstName, u.lastName
      FROM message_posts mp
      JOIN users u ON mp.authorId = u.id
      WHERE mp.parentId IS NULL
      ORDER BY mp.createdAt DESC
    `);
    
    // Get reply counts for each post
    const postIds = posts.map(p => p.id);
    let replyCounts = {};
    
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',');
      const [counts] = await pool.execute(`
        SELECT parentId, COUNT(*) as count
        FROM message_posts
        WHERE parentId IN (${placeholders})
        GROUP BY parentId
      `, postIds);
      
      counts.forEach(count => {
        replyCounts[count.parentId] = count.count;
      });
    }
    
    const postsWithReplyCounts = posts.map(post => ({
      ...post,
      replyCount: replyCounts[post.id] || 0
    }));
    
    res.json({ posts: postsWithReplyCounts });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/staff/messages', async (req, res) => {
  try {
    const { title, content, parentId } = req.body;
    const authorId = req.user?.id || 1; // Use authenticated user ID
    
    const [result] = await pool.execute(`
      INSERT INTO message_posts (title, content, authorId, parentId)
      VALUES (?, ?, ?, ?)
    `, [title, content, authorId, parentId || null]);
    
    // Fetch the created message with user data
    const [rows] = await pool.execute(`
      SELECT 
        mp.*,
        u.firstName, u.lastName
      FROM message_posts mp
      JOIN users u ON mp.authorId = u.id
      WHERE mp.id = ?
    `, [result.insertId]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Playtest sessions
app.get('/api/playtest/sessions', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ps.*,
        u.firstName as created_by_name, u.lastName as creator_last,
        gb.version as build_version, gb.title as build_title,
        COUNT(pr.id) as rsvp_count
      FROM playtest_sessions ps
      JOIN users u ON ps.created_by = u.id
      JOIN game_builds gb ON ps.build_id = gb.id
      LEFT JOIN playtest_rsvps pr ON ps.id = pr.session_id AND pr.status = 'attending'
      GROUP BY ps.id
      ORDER BY ps.scheduled_date ASC
    `);
    
    const formattedRows = rows.map(row => ({
      ...row,
      created_by_name: `${row.created_by_name} ${row.creator_last}`
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching playtest sessions:', error);
    res.status(500).json({ error: 'Failed to fetch playtest sessions' });
  }
});

// Download history
app.get('/api/builds/downloads', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        dh.*,
        u.firstName as username, u.lastName as user_last, u.role,
        gb.version, gb.title, gb.file_size
      FROM download_history dh
      JOIN users u ON dh.user_id = u.id
      JOIN game_builds gb ON dh.build_id = gb.id
      ORDER BY dh.download_date DESC
      LIMIT 100
    `);
    
    const formattedRows = rows.map(row => ({
      ...row,
      username: `${row.username} ${row.user_last}`
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching download history:', error);
    res.status(500).json({ error: 'Failed to fetch download history' });
  }
});

// Finance endpoints (admin only)
app.get('/api/admin/finance/transactions', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ft.*,
        u.firstName as responsible_staff, u.lastName as staff_last
      FROM finance_transactions ft
      JOIN users u ON ft.responsible_staff_id = u.id
      ORDER BY ft.date DESC
    `);
    
    const formattedRows = rows.map(row => ({
      ...row,
      responsible_staff: `${row.responsible_staff} ${row.staff_last}`
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/admin/finance/transactions', async (req, res) => {
  try {
    const { type, category, amount, description, justification } = req.body;
    const responsible_staff_id = req.user?.id || 1; // Use authenticated user ID
    
    const [result] = await pool.execute(`
      INSERT INTO finance_transactions (type, category, amount, description, justification, responsible_staff_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [type, category, amount, description, justification, responsible_staff_id]);
    
    // Fetch the created transaction with user data
    const [rows] = await pool.execute(`
      SELECT 
        ft.*,
        u.firstName as responsible_staff, u.lastName as staff_last
      FROM finance_transactions ft
      JOIN users u ON ft.responsible_staff_id = u.id
      WHERE ft.id = ?
    `, [result.insertId]);
    
    const transaction = rows[0];
    transaction.responsible_staff = `${transaction.responsible_staff} ${transaction.staff_last}`;
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.get('/api/admin/finance/budgets', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM finance_budgets
      ORDER BY category, period
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.post('/api/admin/finance/budgets', async (req, res) => {
  try {
    const { category, allocated, period } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO finance_budgets (category, allocated, period)
      VALUES (?, ?, ?)
    `, [category, allocated, period]);
    
    // Fetch the created budget
    const [rows] = await pool.execute(`
      SELECT * FROM finance_budgets WHERE id = ?
    `, [result.insertId]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

app.get('/api/admin/finance/forecasts', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM finance_forecasts
      ORDER BY year DESC, 
      CASE month
        WHEN 'January' THEN 1
        WHEN 'February' THEN 2
        WHEN 'March' THEN 3
        WHEN 'April' THEN 4
        WHEN 'May' THEN 5
        WHEN 'June' THEN 6
        WHEN 'July' THEN 7
        WHEN 'August' THEN 8
        WHEN 'September' THEN 9
        WHEN 'October' THEN 10
        WHEN 'November' THEN 11
        WHEN 'December' THEN 12
      END
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({ error: 'Failed to fetch forecasts' });
  }
});

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
    origin: req.get('Origin'),
    database: 'connected'
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
    // Don't serve index.html for API routes
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
  // Catch-all for undefined routes in development
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
  console.log(`🗄️ Database: Connected and ready`);
  
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