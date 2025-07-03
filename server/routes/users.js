import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile data
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, email, firstName, lastName, role, cookiesAccepted, createdAt FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile details
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;
    const updates = [];
    const values = [];

    if (firstName !== undefined) {
      updates.push('firstName = ?');
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push('lastName = ?');
      values.push(lastName);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cookie preferences
router.put('/cookies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cookiesAccepted } = req.body;

    if (typeof cookiesAccepted !== 'boolean') {
      return res.status(400).json({ error: 'cookiesAccepted must be boolean' });
    }

    await pool.execute('UPDATE users SET cookiesAccepted = ? WHERE id = ?', [cookiesAccepted, userId]);
    res.json({ message: 'Cookie preferences updated' });
  } catch (error) {
    console.error('Cookie preference update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's stored data (for privacy compliance)
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const [userData] = await pool.execute(
      "SELECT id, email, firstName, lastName, role, cookiesAccepted, createdAt, updatedAt FROM users WHERE id = ?",
      [userId]
    );

    // Get user's game builds (if staff)
    const staffRoles = ['dev_tester', 'developer', 'staff', 'admin', 'ceo'];
    let gameBuilds = [];
    if (staffRoles.includes(req.user.role)) {
      const [builds] = await pool.execute(
        'SELECT id, name, version, description, upload_date AS uploadDate FROM game_builds WHERE uploaded_by = ?',
        [userId]
      );
      gameBuilds = builds;
    }

    // Get user's message posts (if staff)
    let messagePosts = [];
    if (staffRoles.includes(req.user.role)) {
      const [posts] = await pool.execute(
        'SELECT id, title, content, createdAt, updatedAt FROM message_posts WHERE authorId = ?',
        [userId]
      );
      messagePosts = posts;
    }

    res.json({
      userData: userData[0],
      gameBuilds,
      messagePosts,
      dataPolicy: {
        passwordStorage: 'Passwords are hashed using bcrypt with 12 salt rounds',
        sessionManagement: 'JWT tokens stored in HTTP-only cookies, expire after 7 days',
        dataRetention: 'Personal data is retained until account deletion',
        thirdPartySharing: 'No personal data is shared with third parties',
        advertising: 'No user tracking for advertising purposes'
      }
    });
  } catch (error) {
    console.error('User data fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;