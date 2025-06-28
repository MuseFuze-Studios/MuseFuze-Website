import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getDB } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const [users] = await db.execute(`
      SELECT id, username, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Update user role (admin only)
router.put('/users/:id/role',
  requireAdmin,
  [body('role').isIn(['user', 'staff', 'admin'])],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { role } = req.body;
      const db = getDB();

      // Prevent admin from demoting themselves
      if (parseInt(id) === req.session.userId && role !== 'admin') {
        return res.status(400).json({ error: 'Cannot demote yourself' });
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

// Delete user (admin only)
router.delete('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.session.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get feature toggles (admin only)
router.get('/features', requireAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const [features] = await db.execute(`
      SELECT * FROM feature_toggles 
      ORDER BY feature_name
    `);

    res.json(features);
  } catch (error) {
    next(error);
  }
});

// Create feature toggle (admin only)
router.post('/features',
  requireAdmin,
  [
    body('feature_name').isLength({ min: 1, max: 100 }).trim(),
    body('description').optional().trim(),
    body('is_enabled').isBoolean()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { feature_name, description, is_enabled } = req.body;
      const db = getDB();

      const [result] = await db.execute(`
        INSERT INTO feature_toggles (feature_name, description, is_enabled) 
        VALUES (?, ?, ?)
      `, [feature_name, description || null, is_enabled]);

      res.status(201).json({
        message: 'Feature toggle created successfully',
        featureId: (result as any).insertId
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update feature toggle (admin only)
router.put('/features/:id',
  requireAdmin,
  [
    body('feature_name').optional().isLength({ min: 1, max: 100 }).trim(),
    body('description').optional().trim(),
    body('is_enabled').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { feature_name, description, is_enabled } = req.body;
      const db = getDB();

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];

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

      await db.execute(
        `UPDATE feature_toggles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({ message: 'Feature toggle updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete feature toggle (admin only)
router.delete('/features/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [result] = await db.execute(
      'DELETE FROM feature_toggles WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Feature toggle not found' });
    }

    res.json({ message: 'Feature toggle deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get system logs (admin only)
router.get('/logs', requireAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const [logs] = await db.execute(`
      SELECT l.*, u.username 
      FROM system_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `);

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// Get dashboard stats (admin only)
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const db = getDB();

    // Get user counts by role
    const [userStats] = await db.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    // Get build count
    const [buildStats] = await db.execute(`
      SELECT COUNT(*) as total_builds 
      FROM game_builds 
      WHERE is_active = true
    `);

    // Get bug report counts by status
    const [bugStats] = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM bug_reports 
      GROUP BY status
    `);

    // Get recent activity
    const [recentActivity] = await db.execute(`
      SELECT 'bug_report' as type, title as description, created_at 
      FROM bug_reports 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      users: userStats,
      builds: (buildStats as any[])[0],
      bugs: bugStats,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
});

export default router;