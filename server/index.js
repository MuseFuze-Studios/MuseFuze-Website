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