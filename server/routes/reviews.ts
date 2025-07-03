import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { requireStaff } from '../middleware/auth.js';

const router = Router();

// Get reviews for a build (staff only)
router.get('/build/:buildId', requireStaff, async (req, res, next) => {
  try {
    const { buildId } = req.params;
    const db = getDB();

    const [reviews] = await db.execute(`
      SELECT r.*, u.username as reviewer_name, b.version as build_version
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN game_builds b ON r.build_id = b.id
      WHERE r.build_id = ?
      ORDER BY r.created_at DESC
    `, [buildId]);

    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

// Create review (staff only)
router.post('/',
  requireStaff,
  [
    body('build_id').isInt(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('feedback').notEmpty().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { build_id, rating, feedback } = req.body;
      const db = getDB();

      // Check if build exists
      const [builds] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM game_builds WHERE id = ? AND is_active = true',
        [build_id]
      );

      if (builds.length === 0) {
        return res.status(404).json({ error: 'Build not found' });
      }

      // Check if user already reviewed this build
      const [existingReviews] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM reviews WHERE build_id = ? AND reviewer_id = ?',
        [build_id, req.session.userId]
      );

      if (existingReviews.length > 0) {
        return res.status(409).json({ error: 'You have already reviewed this build' });
      }

      const [result] = await db.execute<ResultSetHeader>(`
        INSERT INTO reviews (build_id, reviewer_id, rating, feedback)
        VALUES (?, ?, ?, ?)
      `, [build_id, req.session.userId, rating, feedback]);

      res.status(201).json({
        message: 'Review created successfully',
        reviewId: result.insertId
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update review (staff only, own reviews only)
router.put('/:id',
  requireStaff,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('feedback').optional().notEmpty().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { rating, feedback } = req.body;
      const db = getDB();

      // Check if review exists and belongs to user
      const [reviews] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM reviews WHERE id = ? AND reviewer_id = ?',
        [id, req.session.userId]
      );

      if (reviews.length === 0) {
        return res.status(404).json({ error: 'Review not found or access denied' });
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: unknown[] = [];

      if (rating !== undefined) {
        updates.push('rating = ?');
        values.push(rating);
      }
      if (feedback !== undefined) {
        updates.push('feedback = ?');
        values.push(feedback);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);

      await db.execute(
        `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({ message: 'Review updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete review (staff only, own reviews only)
router.delete('/:id', requireStaff, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM reviews WHERE id = ? AND reviewer_id = ?',
      [id, req.session.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;