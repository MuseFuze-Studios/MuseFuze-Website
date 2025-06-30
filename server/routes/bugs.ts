import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { ResultSetHeader } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { requireStaff, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all bug reports (staff only)
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const db = getDB();
    const [bugs] = await db.execute(`
      SELECT b.*, 
             reporter.username as reporter_name,
             assignee.username as assignee_name,
             gb.version as build_version,
             gb.title as build_title
      FROM bug_reports b
      LEFT JOIN users reporter ON b.reported_by = reporter.id
      LEFT JOIN users assignee ON b.assigned_to = assignee.id
      LEFT JOIN game_builds gb ON b.build_id = gb.id
      ORDER BY b.created_at DESC
    `);

    res.json(bugs);
  } catch (error) {
    next(error);
  }
});

// Create bug report (staff only)
router.post('/',
  requireStaff,
  [
    body('title').isLength({ min: 1, max: 200 }).trim(),
    body('description').notEmpty().trim(),
    body('priority').isIn(['low', 'medium', 'high', 'critical']),
    body('build_id').optional().isInt(),
    body('tags').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, priority, build_id, tags } = req.body;
      const db = getDB();

      const [result] = await db.execute<ResultSetHeader>(`
        INSERT INTO bug_reports (title, description, priority, build_id, tags, reported_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        title,
        description,
        priority,
        build_id || null,
        tags ? JSON.stringify(tags) : null,
        req.session.userId
      ]);

      res.status(201).json({
        message: 'Bug report created successfully',
        bugId: result.insertId
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update bug report (staff only)
router.put('/:id',
  requireStaff,
  [
    body('title').optional().isLength({ min: 1, max: 200 }).trim(),
    body('description').optional().notEmpty().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('status').optional().isIn(['open', 'in_progress', 'fixed', 'closed']),
    body('tags').optional().isArray(),
    body('assigned_to').optional().isInt(),
    body('build_id').optional().isInt()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, description, priority, status, tags, assigned_to, build_id } = req.body;
      const db = getDB();

      // Build dynamic update query
      const updates: string[] = [];
      const values: unknown[] = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (priority !== undefined) {
        updates.push('priority = ?');
        values.push(priority);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
      }
      if (tags !== undefined) {
        updates.push('tags = ?');
        values.push(JSON.stringify(tags));
      }
      if (assigned_to !== undefined) {
        updates.push('assigned_to = ?');
        values.push(assigned_to);
      }
      if (build_id !== undefined) {
        updates.push('build_id = ?');
        values.push(build_id);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);

      await db.execute(
        `UPDATE bug_reports SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({ message: 'Bug report updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Get team members for assignment
router.get('/team-members', requireStaff, async (req, res, next) => {
  try {
    const db = getDB();
    const [members] = await db.execute(`
      SELECT id, username, role 
      FROM users 
      WHERE role IN ('dev_tester', 'developer', 'staff', 'admin', 'ceo')
      ORDER BY role, username
    `);

    res.json(members);
  } catch (error) {
    next(error);
  }
});

// Delete bug report (admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM bug_reports WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    res.json({ message: 'Bug report deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;