import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
  }
}

// Optional: define types for request/response bodies
type MyBodyType = Record<string, unknown>; // or a specific shape
type MyResponseType = { error: string };

// Middleware to require authentication
export const requireAuth = (
  req: Request<Record<string, unknown>, MyResponseType, MyBodyType>,
  res: Response<MyResponseType>,
  next: NextFunction
) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to require a specific role or roles
export const requireRole = (roles: string[]) => {
  return (
    req: Request<Record<string, unknown>, MyResponseType, MyBodyType>,
    res: Response<MyResponseType>,
    next: NextFunction
  ) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Specific role checks
export const requireStaff = requireRole(['dev_tester', 'developer', 'staff', 'admin', 'ceo']);
export const requireAdmin = requireRole(['admin', 'ceo']);
export const requireCEO = requireRole(['ceo']);
export const requireDeveloper = requireRole(['developer', 'admin', 'ceo']);
export const requireDevTester = requireRole(['dev_tester', 'developer', 'staff', 'admin', 'ceo']);
