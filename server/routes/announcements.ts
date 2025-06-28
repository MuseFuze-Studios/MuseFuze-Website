import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getDB } from '../config/database.js';
import { requireStaff, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get announcements for current user's role
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const db = getDB();
    const userRole = req.session.role;

    const [announcements] = await db.execute(`
      SELECT a.*, u.username as author_name
      FROM team_announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE JSON_CONTAINS(a.target_roles, ?) OR JSON_CONTAINS(a.target_roles, '"all"')
      ORDER BY a.is_sticky DESC, a.created_at DESC
    `, [JSON.stringify(userRole)]);

    res.json(announcements);
  } catch (error) {
    next(error);
  }
});

// Create announcement (admin only)
router.post('/',
  requireAdmin,
  [
    body('title').isLength({ min: 1, max: 200 }).trim(),
    body('content').notEmpty().trim(),
    body('is_sticky').isBoolean(),
    body('target_roles').isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, is_sticky, target_roles } = req.body;
      const db = getDB();

      const [result] = await db.execute(`
        INSERT INTO team_announcements (title, content, author_id, is_sticky, target_roles)
        VALUES (?, ?, ?, ?, ?)
      `, [title, content, req.session.userId, is_sticky, JSON.stringify(target_roles)]);

      res.status(201).json({
        message: 'Announcement created successfully',
        announcementId: (result as any).insertId
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update announcement
router.put('/:id',
  requireAdmin,
  [
    body('title').optional().isLength({ min: 1, max: 200 }).trim(),
    body('content').optional().notEmpty().trim(),
    body('is_sticky').optional().isBoolean(),
    body('target_roles').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, content, is_sticky, target_roles } = req.body;
      const db = getDB();

      const updates: string[] = [];
      const values: any[] = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (content !== undefined) {
        updates.push('content = ?');
        values.push(content);
      }
      if (is_sticky !== undefined) {
        updates.push('is_sticky = ?');
        values.push(is_sticky);
      }
      if (target_roles !== undefined) {
        updates.push('target_roles = ?');
        values.push(JSON.stringify(target_roles));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);

      await db.execute(
        `UPDATE team_announcements SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({ message: 'Announcement updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete announcement
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [result] = await db.execute(
      'DELETE FROM team_announcements WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;