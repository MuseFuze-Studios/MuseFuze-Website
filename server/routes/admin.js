import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, firstName, lastName, role, createdAt FROM users ORDER BY createdAt DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const allowedRoles = ['user', 'dev_tester', 'developer', 'staff', 'admin', 'ceo'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user details
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
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
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;