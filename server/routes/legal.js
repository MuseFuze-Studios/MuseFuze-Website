import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Update user consent preferences
router.post('/consent',
  authenticateToken,
  [
    body('data_processing').isBoolean(),
    body('marketing').isBoolean(),
    body('cookies').isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data_processing, marketing, cookies } = req.body;
      const userId = req.user.id;

      await pool.execute(
        'UPDATE users SET data_processing_consent = ?, marketing_consent = ?, cookie_preferences = ? WHERE id = ?',
        [data_processing, marketing, JSON.stringify(cookies), userId]
      );

      res.json({ message: 'Consent preferences updated successfully' });
    } catch (error) {
      console.error('Consent update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get user consent preferences
router.get('/consent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT data_processing_consent, marketing_consent, cookie_preferences FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    res.json({
      data_processing: user.data_processing_consent,
      marketing: user.marketing_consent,
      cookies: user.cookie_preferences ? JSON.parse(user.cookie_preferences) : {},
    });
  } catch (error) {
    console.error('Consent fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request account deletion
router.post('/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    if (['admin', 'ceo'].includes(user.role)) {
      return res.status(400).json({
        error: 'Admin and CEO accounts cannot be deleted through this method. Contact system administrator.'
      });
    }

    await pool.execute(
      `UPDATE users SET
        email = CONCAT('deleted_', id, '@deleted.local'),
        password = 'DELETED',
        firstName = 'DELETED',
        lastName = 'USER',
        isActive = FALSE,
        data_processing_consent = FALSE,
        marketing_consent = FALSE,
        cookie_preferences = NULL
      WHERE id = ?`,
      [userId]
    );

    res.clearCookie('authToken');
    res.json({ message: 'Account deletion completed successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;