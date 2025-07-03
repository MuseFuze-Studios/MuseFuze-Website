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

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get user stats
    const [userStats] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    // Get build stats
    const [buildStats] = await pool.execute(
      'SELECT COUNT(*) as total_builds FROM game_builds WHERE isActive = TRUE'
    );

    // Get bug stats (if table exists)
    let bugStats = [];
    try {
      const [bugs] = await pool.execute(
        'SELECT status, COUNT(*) as count FROM bug_reports GROUP BY status'
      );
      bugStats = bugs;
    } catch (error) {
      // Bug reports table might not exist
      console.log('Bug reports table not found, using empty data');
    }

    // Get recent activity (simplified)
    const recentActivity = [
      {
        type: 'user_registration',
        description: 'New user registered',
        created_at: new Date().toISOString()
      },
      {
        type: 'build_upload',
        description: 'New build uploaded',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    res.json({
      users: userStats,
      builds: buildStats[0] || { total_builds: 0 },
      bugs: bugStats,
      recentActivity
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get server status
router.get('/server-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // In a real implementation, you would gather actual server metrics
    // For now, we'll return simulated data
    const status = {
      cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
      memory: Math.floor(Math.random() * 40) + 30, // 30-70%
      disk: Math.floor(Math.random() * 20) + 40, // 40-60%
      uptime: formatUptime(process.uptime()),
      connections: Math.floor(Math.random() * 50) + 10,
      database: 'Connected',
      lastUpdated: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    console.error('Server status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default router;