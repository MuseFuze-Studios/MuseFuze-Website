import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/database.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';
import { 
  validateGameBuild, 
  validateMessagePost, 
  validateBugReport, 
  validateReview, 
  validatePlaytestSession,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();

// File upload configuration
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
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.rar', '.7z', '.exe'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only ZIP, RAR, 7Z, and EXE files are allowed.'));
    }
  }
});

// Game Builds Routes
router.get('/builds', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [builds] = await pool.execute(`
      SELECT 
        gb.*,
        CONCAT(u.firstName, ' ', u.lastName) as uploaded_by_name
      FROM game_builds gb
      LEFT JOIN users u ON gb.uploaded_by = u.id
      WHERE gb.isActive = TRUE
      ORDER BY gb.upload_date DESC
    `);
    
    res.json({ builds });
  } catch (error) {
    console.error('Builds fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/builds', authenticateToken, requireStaff, upload.single('buildFile'), validateGameBuild, handleValidationErrors, async (req, res) => {
  try {
    const { name, version, description, externalUrl, testInstructions, knownIssues } = req.body;
    const filePath = req.file ? req.file.path : null;
    const fileSize = req.file ? req.file.size : 0;

    if (!filePath && !externalUrl) {
      return res.status(400).json({ error: 'Either a file upload or external URL is required' });
    }

    const [result] = await pool.execute(`
      INSERT INTO game_builds (name, version, description, file_path, file_size, external_url, test_instructions, known_issues, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, version, description, filePath, fileSize, externalUrl, testInstructions, knownIssues, req.user.id]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Build uploaded successfully' 
    });
  } catch (error) {
    console.error('Build upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/builds/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const buildId = req.params.id;
    
    // Get file path before deletion
    const [builds] = await pool.execute('SELECT file_path FROM game_builds WHERE id = ?', [buildId]);
    
    if (builds.length > 0 && builds[0].file_path) {
      // Delete file from filesystem
      try {
        fs.unlinkSync(builds[0].file_path);
      } catch (fileError) {
        console.warn('Could not delete file:', fileError);
      }
    }

    await pool.execute('UPDATE game_builds SET isActive = FALSE WHERE id = ?', [buildId]);
    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Build deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Message Board Routes
router.get('/messages', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT 
        mp.*,
        u.firstName,
        u.lastName,
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

router.get('/messages/:id/replies', authenticateToken, requireStaff, async (req, res) => {
  try {
    const postId = req.params.id;
    const [replies] = await pool.execute(`
      SELECT 
        mp.*,
        u.firstName,
        u.lastName
      FROM message_posts mp
      JOIN users u ON mp.authorId = u.id
      WHERE mp.parentId = ?
      ORDER BY mp.createdAt ASC
    `, [postId]);
    
    res.json({ replies });
  } catch (error) {
    console.error('Replies fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/messages', authenticateToken, requireStaff, validateMessagePost, handleValidationErrors, async (req, res) => {
  try {
    const { title, content, parentId } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO message_posts (title, content, authorId, parentId)
      VALUES (?, ?, ?, ?)
    `, [title, content, req.user.id, parentId || null]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Message posted successfully' 
    });
  } catch (error) {
    console.error('Message post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/messages/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Check if user owns the message or is admin
    const [messages] = await pool.execute('SELECT authorId FROM message_posts WHERE id = ?', [messageId]);
    
    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (messages[0].authorId !== req.user.id && !['admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await pool.execute('DELETE FROM message_posts WHERE id = ? OR parentId = ?', [messageId, messageId]);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Message deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Announcements Route
router.get('/announcements', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [announcements] = await pool.execute(`
      SELECT 
        ta.*,
        CONCAT(u.firstName, ' ', u.lastName) as author_name
      FROM team_announcements ta
      JOIN users u ON ta.author_id = u.id
      ORDER BY ta.is_sticky DESC, ta.created_at DESC
    `);
    
    res.json(announcements);
  } catch (error) {
    console.error('Announcements fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bug Reports Routes
router.get('/bugs', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [bugs] = await pool.execute(`
      SELECT 
        br.*,
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
    console.error('Bugs fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/bugs', authenticateToken, requireStaff, validateBugReport, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, priority, build_id, tags, assigned_to } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO bug_reports (title, description, priority, build_id, tags, reported_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, priority, build_id, JSON.stringify(tags || []), req.user.id, assigned_to]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Bug report created successfully' 
    });
  } catch (error) {
    console.error('Bug report creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bugs/team-members', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [members] = await pool.execute(`
      SELECT 
        id,
        CONCAT(firstName, ' ', lastName) as username,
        role
      FROM users 
      WHERE role IN ('dev_tester', 'developer', 'staff', 'admin', 'ceo')
      AND isActive = TRUE
      ORDER BY firstName, lastName
    `);
    
    res.json(members);
  } catch (error) {
    console.error('Team members fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reviews Routes
router.get('/reviews/build/:buildId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const buildId = req.params.buildId;
    const [reviews] = await pool.execute(`
      SELECT 
        r.*,
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

router.post('/reviews', authenticateToken, requireStaff, validateReview, handleValidationErrors, async (req, res) => {
  try {
    const { build_id, rating, feedback } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO reviews (build_id, reviewer_id, rating, feedback)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), feedback = VALUES(feedback), updated_at = CURRENT_TIMESTAMP
    `, [build_id, req.user.id, rating, feedback]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Review submitted successfully' 
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Playtest Sessions Routes
router.get('/playtest/sessions', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [sessions] = await pool.execute(`
      SELECT 
        ps.*,
        CONCAT(u.firstName, ' ', u.lastName) as created_by_name,
        gb.version as build_version,
        gb.name as build_title,
        (SELECT COUNT(*) FROM playtest_rsvps WHERE session_id = ps.id AND status = 'attending') as rsvp_count
      FROM playtest_sessions ps
      JOIN users u ON ps.created_by = u.id
      JOIN game_builds gb ON ps.build_id = gb.id
      ORDER BY ps.scheduled_date ASC
    `);
    
    res.json(sessions);
  } catch (error) {
    console.error('Playtest sessions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/playtest/sessions', authenticateToken, requireStaff, validatePlaytestSession, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, build_id, scheduled_date, duration_minutes, max_participants, location, test_focus, requirements } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO playtest_sessions (title, description, build_id, scheduled_date, duration_minutes, max_participants, location, test_focus, requirements, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, build_id, scheduled_date, duration_minutes, max_participants, location, test_focus, requirements, req.user.id]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Playtest session created successfully' 
    });
  } catch (error) {
    console.error('Playtest session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download History Route
router.get('/downloads', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [downloads] = await pool.execute(`
      SELECT 
        dh.*,
        CONCAT(u.firstName, ' ', u.lastName) as username,
        u.role,
        gb.version,
        gb.name as title,
        gb.file_size
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

export default router;