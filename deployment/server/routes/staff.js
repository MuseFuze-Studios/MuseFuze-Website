import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';
import { validateGameBuild, validateMessagePost, handleValidationErrors } from '../middleware/validation.js';

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
    // Allow common game build file types
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

// Game Builds Routes

// Get all game builds
router.get('/builds', authenticateToken, requireStaff, async (req, res) => {
  try {
    const [builds] = await pool.execute(`
      SELECT gb.*, u.firstName, u.lastName 
      FROM game_builds gb 
      JOIN users u ON gb.uploadedBy = u.id 
      WHERE gb.isActive = TRUE 
      ORDER BY gb.uploadDate DESC
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
    const { name, version, description, externalUrl } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!fileUrl && !externalUrl) {
      return res.status(400).json({ error: 'Either a file upload or external URL is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO game_builds (name, version, description, fileUrl, externalUrl, uploadedBy) VALUES (?, ?, ?, ?, ?, ?)',
      [name, version, description, fileUrl, externalUrl, req.user.id]
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

// Delete game build
router.delete('/builds/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const buildId = req.params.id;

    // Check if build exists and user owns it
    const [builds] = await pool.execute(
      'SELECT uploadedBy FROM game_builds WHERE id = ? AND isActive = TRUE',
      [buildId]
    );

    if (builds.length === 0) {
      return res.status(404).json({ error: 'Build not found' });
    }

    if (builds[0].uploadedBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own builds' });
    }

    // Soft delete
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

// Message Board Routes

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

    // If it's a reply, verify parent exists
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

// Update message post
router.put('/messages/:id', authenticateToken, requireStaff, validateMessagePost, handleValidationErrors, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;

    // Check if post exists and user owns it
    const [posts] = await pool.execute(
      'SELECT authorId FROM message_posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (posts[0].authorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    await pool.execute(
      'UPDATE message_posts SET title = ?, content = ?, isEdited = TRUE WHERE id = ?',
      [title, content, postId]
    );

    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Message update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message post
router.delete('/messages/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if post exists and user owns it
    const [posts] = await pool.execute(
      'SELECT authorId FROM message_posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (posts[0].authorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Delete post and all replies (CASCADE will handle this)
    await pool.execute('DELETE FROM message_posts WHERE id = ?', [postId]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Message delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;