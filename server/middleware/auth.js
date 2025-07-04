import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, email, firstName, lastName, role, isActive FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireStaff = (req, res, next) => {
  const staffRoles = ['dev_tester', 'developer', 'staff', 'admin', 'ceo'];
  
  if (!req.user || !staffRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  
  next();
};

export const requireAdmin = (req, res, next) => {
  const adminRoles = ['admin', 'ceo'];
  
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};