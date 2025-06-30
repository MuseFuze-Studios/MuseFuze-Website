import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { getDB } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { OkPacket, RowDataPacket } from 'mysql2';

const router = Router();

// Get all users (admin only)
router.get('/users', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const [users] = await db.execute<RowDataPacket[]>(
      `SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Update user role (admin only)
router.put('/users/:id/role', requireAdmin, [body('role').isIn(['user', 'staff', 'admin'])], async (req: Request<{ id: string }, unknown, { role: 'user' | 'staff' | 'admin' }>, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;
    const db = getDB();

    if (parseInt(id) === req.session.userId && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote yourself' });
    }

    await db.execute<OkPacket>('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/users/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDB();

    if (parseInt(id) === req.session.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const [result] = await db.execute<OkPacket>('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get feature toggles (admin only)
router.get('/features', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const [features] = await db.execute<RowDataPacket[]>('SELECT * FROM feature_toggles ORDER BY feature_name');
    res.json(features);
  } catch (error) {
    next(error);
  }
});

// Create feature toggle (admin only)
router.post('/features', requireAdmin, [
  body('feature_name').isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().trim(),
  body('is_enabled').isBoolean()
], async (req: Request<unknown, unknown, { feature_name: string; description?: string; is_enabled: boolean }>, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { feature_name, description, is_enabled } = req.body;
    const db = getDB();

    const [result] = await db.execute<OkPacket>(
      'INSERT INTO feature_toggles (feature_name, description, is_enabled) VALUES (?, ?, ?)',
      [feature_name, description || null, is_enabled]
    );

    res.status(201).json({
      message: 'Feature toggle created successfully',
      featureId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Update feature toggle (admin only)
router.put('/features/:id', requireAdmin, [
  body('feature_name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().trim(),
  body('is_enabled').optional().isBoolean()
], async (req: Request<{ id: string }, unknown, { feature_name?: string; description?: string; is_enabled?: boolean }>, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { feature_name, description, is_enabled } = req.body;
    const db = getDB();

    const updates: string[] = [];
    const values: (string | boolean | null)[] = [];

    if (feature_name !== undefined) {
      updates.push('feature_name = ?');
      values.push(feature_name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (is_enabled !== undefined) {
      updates.push('is_enabled = ?');
      values.push(is_enabled);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await db.execute<OkPacket>(
      `UPDATE feature_toggles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Feature toggle updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete feature toggle (admin only)
router.delete('/features/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [result] = await db.execute<OkPacket>('DELETE FROM feature_toggles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Feature toggle not found' });
    }

    res.json({ message: 'Feature toggle deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get system logs (admin only)
router.get('/logs', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const [logs] = await db.execute<RowDataPacket[]>(
      `SELECT l.*, u.username FROM system_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 100`
    );
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// Get dashboard stats (admin only)
router.get('/stats', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDB();

    const [userStats] = await db.execute<RowDataPacket[]>(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    const [buildStats] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total_builds FROM game_builds WHERE is_active = true'
    );

    const [bugStats] = await db.execute<RowDataPacket[]>(
      'SELECT status, COUNT(*) as count FROM bug_reports GROUP BY status'
    );

    const [recentActivity] = await db.execute<RowDataPacket[]>(
      `SELECT 'bug_report' as type, title as description, created_at FROM bug_reports ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      users: userStats,
      builds: buildStats[0],
      bugs: bugStats,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
});

export default router;
