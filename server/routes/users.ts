import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { RowDataPacket } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

const router = Router();

// Get current user profile
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const [users] = await db.execute<RowDataPacket[]>(`
      SELECT id, username, email, role, created_at,
             data_processing_consent, marketing_consent, cookie_preferences
      FROM users WHERE id = ?
    `, [req.session.userId]);

    const user = users[0] as RowDataPacket | undefined;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile',
  requireAuth,
  [
    body('username').optional().isLength({ min: 3, max: 50 }).trim(),
    body('email').optional().isEmail().normalizeEmail()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email } = req.body;
      const db = getDB();

      const updates: string[] = [];
      const values: unknown[] = [];

      if (username !== undefined) {
        updates.push('username = ?');
        values.push(username);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(req.session.userId);

      await db.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Update user role (staff can assign dev_tester, developer roles)
router.put('/:id/role',
  requireStaff,
  [body('role').isIn(['user', 'dev_tester', 'developer', 'staff', 'admin', 'ceo'])],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { role } = req.body;
      const db = getDB();
      const currentUserRole = req.session.role;

      // Role hierarchy check
      const roleHierarchy = {
        'user': 0,
        'dev_tester': 1,
        'developer': 2,
        'staff': 3,
        'admin': 4,
        'ceo': 5
      };

      const currentUserLevel = roleHierarchy[currentUserRole as keyof typeof roleHierarchy];
      const targetRoleLevel = roleHierarchy[role as keyof typeof roleHierarchy];

      // Staff can only assign roles below their level
      if (currentUserLevel <= targetRoleLevel && currentUserRole !== 'ceo') {
        return res.status(403).json({ 
          error: 'Insufficient permissions to assign this role' 
        });
      }

      // Prevent staff from modifying admin/ceo accounts
      const [targetUser] = await db.execute<RowDataPacket[]>('SELECT role FROM users WHERE id = ?', [id]);
      const targetUserRole = targetUser[0]?.role as string | undefined;
      
      if (targetUserRole && roleHierarchy[targetUserRole] >= currentUserLevel && currentUserRole !== 'ceo') {
        return res.status(403).json({ 
          error: 'Cannot modify users with equal or higher privileges' 
        });
      }

      await db.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, id]
      );

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;