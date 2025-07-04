import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/database.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';
import { validateBugReport, validateReview, validatePlaytestSession, validateFinanceTransaction, validateBudget, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/builds';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.rar', '.7z', '.exe'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only ZIP, RAR, 7Z, and EXE files are allowed.'));
    }
  }
});

// Apply staff authentication to all routes
router.use(authenticateToken);
router.use(requireStaff);

// Team Announcements
router.get('/announcements', async (req, res) => {
  try {
    const [announcements] = await pool.execute(`
      SELECT ta.*, u.firstName, u.lastName,
             CONCAT(u.firstName, ' ', u.lastName) as author_name
      FROM team_announcements ta
      JOIN users u ON ta.author_id = u.id
      ORDER BY ta.is_sticky DESC, ta.created_at DESC
    `);
    res.json(announcements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bug Reports
router.get('/bugs', async (req, res) => {
  try {
    const [bugs] = await pool.execute(`
      SELECT br.*, 
             CONCAT(reporter.firstName, ' ', reporter.lastName) as reporter_name,
             CONCAT(assignee.firstName, ' ', assignee.lastName) as assignee_name,
             gb.version as build_version,
             gb.name as build_title
      FROM bug_reports br
      JOIN users reporter ON br.reported_by = reporter.id
      LEFT JOIN users assignee ON br.assigned_to = assignee.id
      LEFT JOIN game_builds gb ON br.build_id = gb.id
      ORDER BY br.created_at DESC
    `);
    res.json(bugs);
  } catch (error) {
    console.error('Failed to fetch bugs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/bugs', validateBugReport, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, priority, build_id, tags, assigned_to } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO bug_reports (title, description, priority, build_id, tags, reported_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, priority, build_id || null, JSON.stringify(tags || []), req.user.id, assigned_to || null]);

    // Fetch the created bug with joined data
    const [bugs] = await pool.execute(`
      SELECT br.*, 
             CONCAT(reporter.firstName, ' ', reporter.lastName) as reporter_name,
             CONCAT(assignee.firstName, ' ', assignee.lastName) as assignee_name,
             gb.version as build_version,
             gb.name as build_title
      FROM bug_reports br
      JOIN users reporter ON br.reported_by = reporter.id
      LEFT JOIN users assignee ON br.assigned_to = assignee.id
      LEFT JOIN game_builds gb ON br.build_id = gb.id
      WHERE br.id = ?
    `, [result.insertId]);

    res.status(201).json(bugs[0]);
  } catch (error) {
    console.error('Failed to create bug report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/bugs/:id', validateBugReport, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, priority, status, assigned_to, tags } = req.body;
    const bugId = req.params.id;

    await pool.execute(`
      UPDATE bug_reports 
      SET title = ?, description = ?, priority = ?, status = ?, assigned_to = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, priority, status, assigned_to || null, JSON.stringify(tags || []), bugId]);

    res.json({ message: 'Bug report updated successfully' });
  } catch (error) {
    console.error('Failed to update bug report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/bugs/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM bug_reports WHERE id = ?', [req.params.id]);
    res.json({ message: 'Bug report deleted successfully' });
  } catch (error) {
    console.error('Failed to delete bug report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team Members for bug assignment
router.get('/bugs/team-members', async (req, res) => {
  try {
    const [members] = await pool.execute(`
      SELECT id, CONCAT(firstName, ' ', lastName) as username, role
      FROM users 
      WHERE role IN ('dev_tester', 'developer', 'staff', 'admin', 'ceo')
      ORDER BY firstName, lastName
    `);
    res.json(members);
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Game Builds
router.get('/builds', async (req, res) => {
  try {
    const [builds] = await pool.execute(`
      SELECT gb.*, CONCAT(u.firstName, ' ', u.lastName) as uploaded_by_name
      FROM game_builds gb
      JOIN users u ON gb.uploaded_by = u.id
      WHERE gb.isActive = TRUE
      ORDER BY gb.upload_date DESC
    `);
    res.json({ builds });
  } catch (error) {
    console.error('Failed to fetch builds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Build upload endpoint
router.post('/builds/upload', upload.single('buildFile'), async (req, res) => {
  try {
    console.log('Build upload request received:', {
      file: req.file ? req.file.originalname : 'No file',
      body: req.body,
      user: req.user.email
    });

    if (!['developer', 'staff', 'admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to upload builds' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, version, description, testInstructions, knownIssues, externalUrl } = req.body;

    if (!name || !version) {
      return res.status(400).json({ error: 'Name and version are required' });
    }

    const [result] = await pool.execute(`
      INSERT INTO game_builds (name, version, description, file_path, file_size, external_url, test_instructions, known_issues, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      version,
      description || null,
      req.file.path,
      req.file.size,
      externalUrl || null,
      testInstructions || null,
      knownIssues || null,
      req.user.id
    ]);

    res.status(201).json({ 
      message: 'Build uploaded successfully',
      buildId: result.insertId
    });
  } catch (error) {
    console.error('Failed to upload build:', error);
    
    // Clean up uploaded file if database insert failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Build deletion endpoint
router.delete('/builds/:id', async (req, res) => {
  try {
    if (!['developer', 'staff', 'admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to delete builds' });
    }

    const buildId = req.params.id;
    
    // Get build info to delete file
    const [builds] = await pool.execute('SELECT file_path FROM game_builds WHERE id = ?', [buildId]);
    
    if (builds.length === 0) {
      return res.status(404).json({ error: 'Build not found' });
    }

    // Delete from database
    await pool.execute('UPDATE game_builds SET isActive = FALSE WHERE id = ?', [buildId]);
    
    // Delete physical file
    const filePath = builds[0].file_path;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Failed to delete build:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Build download endpoint
router.get('/builds/:id/download', async (req, res) => {
  try {
    const buildId = req.params.id;
    
    // Get build info
    const [builds] = await pool.execute(`
      SELECT * FROM game_builds WHERE id = ? AND isActive = TRUE
    `, [buildId]);
    
    if (builds.length === 0) {
      return res.status(404).json({ error: 'Build not found' });
    }
    
    const build = builds[0];
    
    // Log download
    await pool.execute(`
      INSERT INTO download_history (build_id, user_id, ip_address, user_agent, file_size)
      VALUES (?, ?, ?, ?, ?)
    `, [buildId, req.user.id, req.ip, req.get('User-Agent'), build.file_size]);
    
    // Serve the actual file if it exists
    if (build.file_path && fs.existsSync(build.file_path)) {
      const fileName = `${build.version}.${path.extname(build.file_path)}`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.sendFile(path.resolve(build.file_path));
    } else {
      // Fallback for builds without files (external URLs)
      const mockFileContent = `Mock build file for ${build.name} v${build.version}`;
      res.setHeader('Content-Disposition', `attachment; filename="${build.version}.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      res.send(Buffer.from(mockFileContent));
    }
    
  } catch (error) {
    console.error('Failed to download build:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reviews
router.get('/reviews/:buildId', async (req, res) => {
  try {
    const [reviews] = await pool.execute(`
      SELECT r.*, 
             CONCAT(u.firstName, ' ', u.lastName) as reviewer_name,
             gb.version as build_version,
             gb.name as build_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN game_builds gb ON r.build_id = gb.id
      WHERE r.build_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.buildId]);
    res.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reviews', validateReview, handleValidationErrors, async (req, res) => {
  try {
    const { build_id, rating, feedback } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO reviews (build_id, reviewer_id, rating, feedback)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), feedback = VALUES(feedback), updated_at = CURRENT_TIMESTAMP
    `, [build_id, req.user.id, rating, feedback]);

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Failed to create review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Messages
router.get('/messages', async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT mp.*, u.firstName, u.lastName,
             (SELECT COUNT(*) FROM message_posts replies WHERE replies.parentId = mp.id) as replyCount
      FROM message_posts mp
      JOIN users u ON mp.authorId = u.id
      WHERE mp.parentId IS NULL
      ORDER BY mp.createdAt DESC
    `);
    res.json({ posts });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { title, content, parentId } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO message_posts (title, content, authorId, parentId)
      VALUES (?, ?, ?, ?)
    `, [title, content, req.user.id, parentId || null]);

    res.status(201).json({ message: 'Message posted successfully' });
  } catch (error) {
    console.error('Failed to create message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/messages/:id/replies', async (req, res) => {
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
    console.error('Failed to fetch replies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    // Check if user owns the message or is admin
    const [messages] = await pool.execute('SELECT authorId FROM message_posts WHERE id = ?', [req.params.id]);
    
    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (messages[0].authorId !== req.user.id && !['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await pool.execute('DELETE FROM message_posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Failed to delete message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Playtest Sessions
router.get('/playtest/sessions', async (req, res) => {
  try {
    const [sessions] = await pool.execute(`
      SELECT ps.*, 
             gb.version as build_version,
             gb.name as build_title,
             CONCAT(u.firstName, ' ', u.lastName) as created_by_name,
             COUNT(pr.id) as rsvp_count
      FROM playtest_sessions ps
      JOIN game_builds gb ON ps.build_id = gb.id
      JOIN users u ON ps.created_by = u.id
      LEFT JOIN playtest_rsvps pr ON ps.id = pr.session_id AND pr.status = 'attending'
      GROUP BY ps.id
      ORDER BY ps.scheduled_date ASC
    `);
    res.json(sessions);
  } catch (error) {
    console.error('Failed to fetch playtest sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/playtest/sessions', validatePlaytestSession, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, build_id, scheduled_date, duration_minutes, max_participants, location, test_focus, requirements } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO playtest_sessions (title, description, build_id, scheduled_date, duration_minutes, max_participants, location, test_focus, requirements, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, build_id, scheduled_date, duration_minutes, max_participants, location, test_focus, requirements, req.user.id]);

    res.status(201).json({ message: 'Playtest session created successfully' });
  } catch (error) {
    console.error('Failed to create playtest session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/playtest/:sessionId/rsvp', async (req, res) => {
  try {
    const [rsvps] = await pool.execute(`
      SELECT status, notes FROM playtest_rsvps 
      WHERE session_id = ? AND user_id = ?
    `, [req.params.sessionId, req.user.id]);
    
    res.json(rsvps[0] || { status: null, notes: null });
  } catch (error) {
    console.error('Failed to fetch RSVP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/playtest/:sessionId/rsvp', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    await pool.execute(`
      INSERT INTO playtest_rsvps (session_id, user_id, status, notes)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP
    `, [req.params.sessionId, req.user.id, status, notes || null]);

    res.json({ message: 'RSVP updated successfully' });
  } catch (error) {
    console.error('Failed to update RSVP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download History
router.get('/builds/downloads', async (req, res) => {
  try {
    const [downloads] = await pool.execute(`
      SELECT dh.*, 
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
    console.error('Failed to fetch download history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Finance endpoints (admin only)
router.get('/finance/transactions', async (req, res) => {
  try {
    if (!['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [transactions] = await pool.execute(`
      SELECT ft.*, CONCAT(u.firstName, ' ', u.lastName) as responsible_staff
      FROM finance_transactions ft
      JOIN users u ON ft.responsible_staff_id = u.id
      ORDER BY ft.date DESC
    `);
    res.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/finance/transactions', validateFinanceTransaction, handleValidationErrors, async (req, res) => {
  try {
    if (!['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { type, category, amount, vat_rate, description, justification, hmrc_category, date } = req.body;
    
    // Calculate VAT amount
    const vatAmount = (Number(amount || 0) * Number(vat_rate || 0)) / 100;
    
    const [result] = await pool.execute(`
      INSERT INTO finance_transactions (type, category, amount, currency, vat_rate, vat_amount, description, justification, hmrc_category, responsible_staff_id, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [type, category, Number(amount || 0), 'GBP', Number(vat_rate || 20.00), Number(vatAmount), description, justification, hmrc_category, req.user.id, date]);

    res.status(201).json({ message: 'Transaction created successfully' });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/finance/budgets', async (req, res) => {
  try {
    if (!['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [budgets] = await pool.execute(`
      SELECT * FROM finance_budgets
      ORDER BY created_at DESC, category ASC
    `);
    res.json(budgets);
  } catch (error) {
    console.error('Failed to fetch budgets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/finance/budgets', validateBudget, handleValidationErrors, async (req, res) => {
  try {
    if (!['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { category, allocated, period } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO finance_budgets (category, allocated, period)
      VALUES (?, ?, ?)
    `, [category, allocated, period]);

    res.status(201).json({ message: 'Budget created successfully' });
  } catch (error) {
    console.error('Failed to create budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/finance/forecasts', async (req, res) => {
  try {
    if (!['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [forecasts] = await pool.execute(`
      SELECT * FROM finance_forecasts
      ORDER BY created_at DESC
    `);
    res.json(forecasts);
  } catch (error) {
    console.error('Failed to fetch forecasts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;