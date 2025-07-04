import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';
import { authenticateToken, requireStaff, requireAdmin } from '../middleware/auth.js';
import { 
  validateGameBuild, 
  validateMessagePost, 
  validateBugReport, 
  validateReview, 
  validatePlaytestSession,
  validateFinanceTransaction,
  validateBudget,
  handleValidationErrors 
} from '../middleware/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      '.zip', '.rar', '.7z', '.tar', '.gz',
      '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm',
      '.apk', '.ipa'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only game build files are allowed.'));
    }
  }
});

// ==================== GAME BUILDS ====================

// Get all game builds
router.get('/builds', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [builds] = await pool.execute(`
      SELECT gb.*, u.firstName, u.lastName 
      FROM game_builds gb 
      JOIN users u ON gb.uploaded_by = u.id
      WHERE gb.isActive = TRUE 
      ORDER BY gb.upload_date DESC
    `);

    res.json({ builds });
  } catch (error) {
    console.error('Builds fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload game build
router.post('/builds', authenticateToken, requireStaff, upload.single('buildFile'), validateGameBuild, handleValidationErrors, async (req, res) => {
  try {
    const { name, version, description, testInstructions, knownIssues } = req.body;
    const externalUrl = req.body.externalUrl ?? null;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileSize = req.file ? req.file.size : 0;

    if (!fileUrl && !externalUrl) {
      return res.status(400).json({ error: 'Either a file upload or external URL is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO game_builds (name, version, description, fileUrl, externalUrl, file_size, test_instructions, known_issues, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, version, description, fileUrl, externalUrl, fileSize, testInstructions, knownIssues, req.user.id]
    );

    res.status(201).json({
      message: 'Game build uploaded successfully',
      build: {
        id: result.insertId,
        name,
        version,
        description,
        fileUrl,
        externalUrl
      }
    });
  } catch (error) {
    console.error('Build upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download game build
router.get('/builds/download/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const buildId = req.params.id;

    const [builds] = await pool.execute(
      'SELECT * FROM game_builds WHERE id = ? AND isActive = TRUE',
      [buildId]
    );

    if (builds.length === 0) {
      return res.status(404).json({ error: 'Build not found' });
    }

    const build = builds[0];

    // Log download
    await pool.execute(
      'INSERT INTO download_history (build_id, user_id, ip_address, user_agent, file_size) VALUES (?, ?, ?, ?, ?)',
      [buildId, req.user.id, req.ip, req.get('User-Agent'), build.file_size]
    );

    if (build.externalUrl) {
      return res.redirect(build.externalUrl);
    }

    if (build.fileUrl) {
      const filePath = path.join(__dirname, '..', build.fileUrl);
      
      const fs = await import('fs');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on server' });
      }

      const filename = `${build.name}-${build.version}${path.extname(filePath)}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        }
      });
    } else {
      res.status(404).json({ error: 'No file or URL available for this build' });
    }
  } catch (error) {
    console.error('Build download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete game build
router.delete('/builds/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const buildId = req.params.id;

    await pool.execute(
      'UPDATE game_builds SET isActive = FALSE WHERE id = ?',
      [buildId]
    );

    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Build delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== MESSAGE BOARD ====================

// Get all message posts
router.get('/messages', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT mp.*, u.firstName, u.lastName,
             (SELECT COUNT(*) FROM message_posts WHERE parentId = mp.id) as replyCount
      FROM message_posts mp 
      JOIN users u ON mp.authorId = u.id 
      WHERE mp.parentId IS NULL
      ORDER BY mp.createdAt DESC
    `);

    res.json({ posts });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get replies for a post
router.get('/messages/:id/replies', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [replies] = await pool.execute(`
      SELECT mp.*, u.firstName, u.lastName
      FROM message_posts mp 
      JOIN users u ON mp.authorId = u.id 
      WHERE mp.parentId = ?
      ORDER BY mp.createdAt ASC
    `, [req.params.id]);

    res.json({ replies });
  } catch (error) {
    console.error('Replies fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create message post
router.post('/messages', authenticateToken, requireStaff, validateMessagePost, handleValidationErrors, async (req, res) => {
  try {
    const { title, content, parentId } = req.body;

    if (parentId) {
      const [parentPosts] = await pool.execute(
        'SELECT id FROM message_posts WHERE id = ?',
        [parentId]
      );

      if (parentPosts.length === 0) {
        return res.status(404).json({ error: 'Parent post not found' });
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO message_posts (title, content, authorId, parentId) VALUES (?, ?, ?, ?)',
      [title, content, req.user.id, parentId || null]
    );

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: result.insertId,
        title,
        content,
        parentId
      }
    });
  } catch (error) {
    console.error('Message post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message post
router.delete('/messages/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const postId = req.params.id;

    const [posts] = await pool.execute(
      'SELECT authorId FROM message_posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (posts[0].authorId !== req.user.id && !['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await pool.execute('DELETE FROM message_posts WHERE id = ?', [postId]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Message delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BUG REPORTS ====================

// Get all bug reports
router.get('/bugs', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [bugs] = await pool.execute(`
      SELECT b.*, 
             reporter.firstName as reporter_firstName, reporter.lastName as reporter_lastName,
             assignee.firstName as assignee_firstName, assignee.lastName as assignee_lastName,
             gb.version as build_version, gb.name as build_title
      FROM bug_reports b
      LEFT JOIN users reporter ON b.reported_by = reporter.id
      LEFT JOIN users assignee ON b.assigned_to = assignee.id
      LEFT JOIN game_builds gb ON b.build_id = gb.id
      ORDER BY b.created_at DESC
    `);

    // Format the response to match frontend expectations
    const formattedBugs = bugs.map(bug => ({
      ...bug,
      reporter_name: bug.reporter_firstName && bug.reporter_lastName 
        ? `${bug.reporter_firstName} ${bug.reporter_lastName}` 
        : 'Unknown',
      assignee_name: bug.assignee_firstName && bug.assignee_lastName 
        ? `${bug.assignee_firstName} ${bug.assignee_lastName}` 
        : null,
      tags: bug.tags ? JSON.parse(bug.tags) : []
    }));

    res.json(formattedBugs);
  } catch (error) {
    console.error('Bugs fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create bug report
router.post('/bugs', authenticateToken, requireStaff, validateBugReport, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, priority, build_id, tags, assigned_to } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO bug_reports (title, description, priority, build_id, tags, reported_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description,
      priority,
      build_id || null,
      tags ? JSON.stringify(tags) : null,
      req.user.id,
      assigned_to || null
    ]);

    res.status(201).json({
      message: 'Bug report created successfully',
      bugId: result.insertId
    });
  } catch (error) {
    console.error('Bug creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bug report
router.put('/bugs/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const bugId = req.params.id;
    const { title, description, priority, status, tags, assigned_to, build_id } = req.body;

    const updates = [];
    const values = [];

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

    values.push(bugId);

    await pool.execute(
      `UPDATE bug_reports SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Bug report updated successfully' });
  } catch (error) {
    console.error('Bug update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bug report
router.delete('/bugs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bugId = req.params.id;

    await pool.execute('DELETE FROM bug_reports WHERE id = ?', [bugId]);

    res.json({ message: 'Bug report deleted successfully' });
  } catch (error) {
    console.error('Bug delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team members for bug assignment
router.get('/bugs/team-members', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [members] = await pool.execute(`
      SELECT id, CONCAT(firstName, ' ', lastName) as username, role 
      FROM users 
      WHERE role IN ('dev_tester', 'developer', 'staff', 'admin', 'ceo')
      ORDER BY role, firstName
    `);

    res.json(members);
  } catch (error) {
    console.error('Team members fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== REVIEWS ====================

// Get reviews for a build
router.get('/reviews/build/:buildId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { buildId } = req.params;
    const [reviews] = await pool.execute(`
      SELECT r.*, 
             CONCAT(u.firstName, ' ', u.lastName) as reviewer_name,
             gb.version as build_version
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN game_builds gb ON r.build_id = gb.id
      WHERE r.build_id = ?
      ORDER BY r.created_at DESC
    `, [buildId]);

    res.json(reviews);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create review
router.post('/reviews', authenticateToken, requireStaff, validateReview, handleValidationErrors, async (req, res) => {
  try {
    const { build_id, rating, feedback } = req.body;

    // Check if build exists
    const [builds] = await pool.execute(
      'SELECT id FROM game_builds WHERE id = ? AND isActive = TRUE',
      [build_id]
    );

    if (builds.length === 0) {
      return res.status(404).json({ error: 'Build not found' });
    }

    const [result] = await pool.execute(`
      INSERT INTO reviews (build_id, reviewer_id, rating, feedback)
      VALUES (?, ?, ?, ?)
    `, [build_id, req.user.id, rating, feedback]);

    res.status(201).json({
      message: 'Review created successfully',
      reviewId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already reviewed this build' });
    }
    console.error('Review creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update review
router.put('/reviews/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, feedback } = req.body;

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT id FROM reviews WHERE id = ? AND reviewer_id = ?',
      [reviewId, req.user.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }

    const updates = [];
    const values = [];

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

    values.push(reviewId);

    await pool.execute(
      `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Review update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete review
router.delete('/reviews/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const reviewId = req.params.id;

    const [result] = await pool.execute(
      'DELETE FROM reviews WHERE id = ? AND reviewer_id = ?',
      [reviewId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Review delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ANNOUNCEMENTS ====================

// Get announcements
router.get('/announcements', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [announcements] = await pool.execute(`
      SELECT a.*, CONCAT(u.firstName, ' ', u.lastName) as author_name
      FROM team_announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE JSON_CONTAINS(a.target_roles, ?) OR JSON_CONTAINS(a.target_roles, '"all"')
      ORDER BY a.is_sticky DESC, a.created_at DESC
    `, [JSON.stringify(req.user.role)]);

    // Parse target_roles JSON
    const formattedAnnouncements = announcements.map(announcement => ({
      ...announcement,
      target_roles: announcement.target_roles ? JSON.parse(announcement.target_roles) : []
    }));

    res.json(formattedAnnouncements);
  } catch (error) {
    console.error('Announcements fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PLAYTEST SESSIONS ====================

// Get playtest sessions
router.get('/playtest/sessions', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [sessions] = await pool.execute(`
      SELECT 
        ps.*,
        gb.version as build_version,
        gb.name as build_title,
        CONCAT(u.firstName, ' ', u.lastName) as created_by_name,
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
    console.error('Playtest sessions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create playtest session
router.post('/playtest/sessions', authenticateToken, requireAdmin, validatePlaytestSession, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, build_id, scheduled_date, duration_minutes, max_participants } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO playtest_sessions
      (title, description, build_id, scheduled_date, duration_minutes, max_participants, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, build_id, scheduled_date, duration_minutes, max_participants, req.user.id]);

    res.status(201).json({
      message: 'Playtest session created successfully',
      sessionId: result.insertId
    });
  } catch (error) {
    console.error('Playtest session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// RSVP to playtest session
router.post('/playtest/sessions/:id/rsvp', authenticateToken, requireStaff, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { status, notes } = req.body;

    if (!['attending', 'maybe', 'not_attending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid RSVP status' });
    }

    await pool.execute(`
      INSERT INTO playtest_rsvps (session_id, user_id, status, notes)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)
    `, [sessionId, req.user.id, status, notes]);

    res.json({ message: 'RSVP updated successfully' });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's RSVP status
router.get('/playtest/sessions/:id/rsvp', authenticateToken, requireStaff, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const [rsvps] = await pool.execute(`
      SELECT * FROM playtest_rsvps
      WHERE session_id = ? AND user_id = ?
    `, [sessionId, req.user.id]);

    const rsvp = rsvps[0] || { status: null, notes: null };
    res.json(rsvp);
  } catch (error) {
    console.error('RSVP fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DOWNLOAD HISTORY ====================

// Get download history
router.get('/builds/downloads', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [downloads] = await pool.execute(`
      SELECT 
        dh.*,
        CONCAT(u.firstName, ' ', u.lastName) as username,
        u.role,
        gb.version,
        gb.name as title
      FROM download_history dh
      JOIN users u ON dh.user_id = u.id
      JOIN game_builds gb ON dh.build_id = gb.id
      ORDER BY dh.download_date DESC
      LIMIT 100
    `);

    res.json(downloads);
  } catch (error) {
    console.error('Download history fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== FINANCE (ADMIN ONLY) ====================

// Get finance transactions
router.get('/admin/finance/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [transactions] = await pool.execute(
      'SELECT * FROM finance_transactions ORDER BY date DESC LIMIT 100'
    );
    res.json(transactions);
  } catch (error) {
    console.error('Finance transactions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create finance transaction
router.post('/admin/finance/transactions', authenticateToken, requireAdmin, validateFinanceTransaction, handleValidationErrors, async (req, res) => {
  try {
    const { type, category, amount, description, justification } = req.body;
    const responsibleStaff = `${req.user.firstName} ${req.user.lastName}`;

    const [result] = await pool.execute(
      'INSERT INTO finance_transactions (type, category, amount, description, justification, responsible_staff) VALUES (?, ?, ?, ?, ?, ?)',
      [type, category, amount, description, justification, responsibleStaff]
    );

    res.status(201).json({
      message: 'Transaction created successfully',
      transactionId: result.insertId
    });
  } catch (error) {
    console.error('Finance transaction creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get finance budgets
router.get('/admin/finance/budgets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [budgets] = await pool.execute(
      'SELECT * FROM finance_budgets ORDER BY category, period'
    );
    res.json(budgets);
  } catch (error) {
    console.error('Finance budgets fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create finance budget
router.post('/admin/finance/budgets', authenticateToken, requireAdmin, validateBudget, handleValidationErrors, async (req, res) => {
  try {
    const { category, allocated, period } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO finance_budgets (category, allocated, period) VALUES (?, ?, ?)',
      [category, allocated, period]
    );

    res.status(201).json({
      message: 'Budget created successfully',
      budgetId: result.insertId
    });
  } catch (error) {
    console.error('Finance budget creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get finance forecasts
router.get('/admin/finance/forecasts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [forecasts] = await pool.execute(
      'SELECT * FROM finance_forecasts ORDER BY id'
    );
    res.json(forecasts);
  } catch (error) {
    console.error('Finance forecasts fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;