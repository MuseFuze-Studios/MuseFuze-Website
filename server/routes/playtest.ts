import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { requireStaff, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get upcoming playtest sessions
router.get('/sessions', requireStaff, async (req, res, next) => {
  try {
    const db = getDB();

    const [sessions] = await db.execute(`
      SELECT 
        ps.*,
        gb.version as build_version,
        gb.title as build_title,
        u.username as created_by_name,
        COUNT(pr.id) as rsvp_count
      FROM playtest_sessions ps
      LEFT JOIN game_builds gb ON ps.build_id = gb.id
      LEFT JOIN users u ON ps.created_by = u.id
      LEFT JOIN playtest_rsvps pr ON ps.id = pr.session_id AND pr.status = 'attending'
      WHERE ps.scheduled_date >= NOW()
      GROUP BY ps.id
      ORDER BY ps.scheduled_date ASC
    `);

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Create playtest session (admin only)
router.post('/sessions',
  requireAdmin,
  [
    body('title').isLength({ min: 1, max: 200 }).trim(),
    body('description').optional().trim(),
    body('build_id').isInt(),
    body('scheduled_date').isISO8601(),
    body('duration_minutes').isInt({ min: 15, max: 480 }),
    body('max_participants').isInt({ min: 1, max: 50 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, build_id, scheduled_date, duration_minutes, max_participants } = req.body;
      const db = getDB();

      const [result] = await db.execute<ResultSetHeader>(`
        INSERT INTO playtest_sessions
        (title, description, build_id, scheduled_date, duration_minutes, max_participants, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [title, description, build_id, scheduled_date, duration_minutes, max_participants, req.session.userId]);

      res.status(201).json({
        message: 'Playtest session created successfully',
        sessionId: result.insertId
      });
    } catch (error) {
      next(error);
    }
  }
);

// RSVP to playtest session
router.post('/sessions/:id/rsvp',
  requireStaff,
  [
    body('status').isIn(['attending', 'maybe', 'not_attending']),
    body('notes').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, notes } = req.body;
      const db = getDB();

      await db.execute(`
        INSERT INTO playtest_rsvps (session_id, user_id, status, notes)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)
      `, [id, req.session.userId, status, notes]);

      res.json({ message: 'RSVP updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's RSVP status for a session
router.get('/sessions/:id/rsvp', requireStaff, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [rsvps] = await db.execute<RowDataPacket[]>(`
      SELECT * FROM playtest_rsvps
      WHERE session_id = ? AND user_id = ?
    `, [id, req.session.userId]);

    const rsvp = rsvps[0] as RowDataPacket | undefined;
    res.json(rsvp || { status: null, notes: null });
  } catch (error) {
    next(error);
  }
});

// Get all RSVPs for a session (admin only)
router.get('/sessions/:id/rsvps', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [rsvps] = await db.execute(`
      SELECT pr.*, u.username, u.role
      FROM playtest_rsvps pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.session_id = ?
      ORDER BY pr.status, u.username
    `, [id]);

    res.json(rsvps);
  } catch (error) {
    next(error);
  }
});

export default router;