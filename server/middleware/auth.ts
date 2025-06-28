import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

export const requireStaff = requireRole(['dev_tester', 'developer', 'staff', 'admin', 'ceo']);
export const requireAdmin = requireRole(['admin', 'ceo']);
export const requireCEO = requireRole(['ceo']);

// Enhanced role checking for specific features
export const requireDeveloper = requireRole(['developer', 'admin', 'ceo']);
export const requireDevTester = requireRole(['dev_tester', 'developer', 'staff', 'admin', 'ceo']);