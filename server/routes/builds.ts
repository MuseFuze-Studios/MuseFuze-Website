import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { body, validationResult } from 'express-validator';
import { getDB } from '../config/database.js';
import { requireStaff, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'server/uploads/builds';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `build-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.rar', '.7z', '.exe'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only zip, rar, 7z, and exe files are allowed.'));
    }
  }
});

// Get all builds (staff only)
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const db = getDB();
    const [builds] = await db.execute(`
      SELECT b.*, u.username as uploaded_by_name 
      FROM game_builds b 
      LEFT JOIN users u ON b.uploaded_by = u.id 
      WHERE b.is_active = true 
      ORDER BY b.upload_date DESC
    `);

    res.json(builds);
  } catch (error) {
    next(error);
  }
});

// Upload new build (admin only)
router.post('/upload',
  requireAdmin,
  upload.single('buildFile'),
  [
    body('version').notEmpty().trim(),
    body('title').isLength({ min: 1, max: 200 }).trim(),
    body('description').optional().trim(),
    body('testInstructions').optional().trim(),
    body('knownIssues').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          await fs.unlink(req.file.path).catch(() => {});
        }
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { version, title, description, testInstructions, knownIssues } = req.body;
      const db = getDB();

      const [result] = await db.execute(`
        INSERT INTO game_builds 
        (version, title, description, file_path, file_size, test_instructions, known_issues, uploaded_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        version,
        title,
        description || null,
        req.file.path,
        req.file.size,
        testInstructions || null,
        knownIssues || null,
        req.session.userId
      ]);

      res.status(201).json({
        message: 'Build uploaded successfully',
        buildId: (result as any).insertId
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  }
);

// Download build (staff only) - with download tracking
router.get('/download/:id', requireStaff, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [builds] = await db.execute(
      'SELECT * FROM game_builds WHERE id = ? AND is_active = true',
      [id]
    );

    const build = (builds as any[])[0];
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    // Check if file exists
    try {
      await fs.access(build.file_path);
    } catch {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Log download
    await db.execute(`
      INSERT INTO download_history (build_id, user_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `, [id, req.session.userId, req.ip, req.get('User-Agent')]);

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${build.version}-${build.title}${path.extname(build.file_path)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    res.download(build.file_path);
  } catch (error) {
    next(error);
  }
});

// Get download history (admin only)
router.get('/downloads', requireAdmin, async (req, res, next) => {
  try {
    const db = getDB();
    const [downloads] = await db.execute(`
      SELECT 
        dh.*,
        u.username,
        u.role,
        gb.version,
        gb.title
      FROM download_history dh
      JOIN users u ON dh.user_id = u.id
      JOIN game_builds gb ON dh.build_id = gb.id
      ORDER BY dh.download_date DESC
      LIMIT 100
    `);

    res.json(downloads);
  } catch (error) {
    next(error);
  }
});

// Delete build (admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [builds] = await db.execute(
      'SELECT file_path FROM game_builds WHERE id = ?',
      [id]
    );

    const build = (builds as any[])[0];
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    // Soft delete (mark as inactive)
    await db.execute(
      'UPDATE game_builds SET is_active = false WHERE id = ?',
      [id]
    );

    // Optionally delete file from filesystem
    try {
      await fs.unlink(build.file_path);
    } catch (error) {
      console.warn('Could not delete file:', build.file_path);
    }

    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;