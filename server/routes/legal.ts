import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { RowDataPacket } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get active legal documents
router.get('/documents/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const db = getDB();

    const [documents] = await db.execute<RowDataPacket[]>(`
      SELECT * FROM legal_documents
      WHERE document_type = ? AND is_active = TRUE
      ORDER BY effective_date DESC
      LIMIT 1
    `, [type]);

    const document = documents[0] as RowDataPacket | undefined;
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

// Update user consent preferences
router.post('/consent',
  requireAuth,
  [
    body('data_processing').isBoolean(),
    body('marketing').isBoolean(),
    body('cookies').isObject()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data_processing, marketing, cookies } = req.body;
      const db = getDB();
      const userId = req.session.userId;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      // Update user preferences
      await db.execute(`
        UPDATE users 
        SET data_processing_consent = ?, marketing_consent = ?, cookie_preferences = ?
        WHERE id = ?
      `, [data_processing, marketing, JSON.stringify(cookies), userId]);

      // Log consent changes
      const consentTypes = [
        { type: 'data_processing', value: data_processing },
        { type: 'marketing', value: marketing },
        { type: 'cookies', value: true } // Simplified for cookies
      ];

      for (const consent of consentTypes) {
        await db.execute(`
          INSERT INTO user_consent_log 
          (user_id, consent_type, consent_given, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?)
        `, [userId, consent.type, consent.value, ipAddress, userAgent]);
      }

      res.json({ message: 'Consent preferences updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Get user consent preferences
router.get('/consent', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const userId = req.session.userId;

    const [users] = await db.execute<RowDataPacket[]>(`
      SELECT data_processing_consent, marketing_consent, cookie_preferences
      FROM users WHERE id = ?
    `, [userId]);

    const user = users[0] as RowDataPacket | undefined;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      data_processing: user.data_processing_consent,
      marketing: user.marketing_consent,
      cookies: user.cookie_preferences ? JSON.parse(user.cookie_preferences) : {}
    });
  } catch (error) {
    next(error);
  }
});

// Request data export (GDPR Article 20)
router.post('/data-export', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const userId = req.session.userId;

    // Collect all user data
    const [userData] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const [bugReports] = await db.execute('SELECT * FROM bug_reports WHERE reported_by = ?', [userId]);
    const [reviews] = await db.execute('SELECT * FROM reviews WHERE reviewer_id = ?', [userId]);
    const [downloads] = await db.execute('SELECT * FROM download_history WHERE user_id = ?', [userId]);
    const [rsvps] = await db.execute('SELECT * FROM playtest_rsvps WHERE user_id = ?', [userId]);
    const [consentLog] = await db.execute('SELECT * FROM user_consent_log WHERE user_id = ?', [userId]);

    const exportData = {
      user_profile: userData,
      bug_reports: bugReports,
      reviews: reviews,
      download_history: downloads,
      playtest_rsvps: rsvps,
      consent_history: consentLog,
      export_date: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// Request account deletion (GDPR Article 17)
router.post('/delete-account', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const userId = req.session.userId;

    // Check if user is admin/ceo (prevent accidental deletion)
    const [users] = await db.execute<RowDataPacket[]>('SELECT role FROM users WHERE id = ?', [userId]);
    const user = users[0] as RowDataPacket | undefined;
    
    if (['admin', 'ceo'].includes(user.role)) {
      return res.status(400).json({ 
        error: 'Admin and CEO accounts cannot be deleted through this method. Contact system administrator.' 
      });
    }

    // Anonymize user data instead of hard delete to maintain referential integrity
    await db.execute(`
      UPDATE users SET 
        username = CONCAT('deleted_user_', id),
        email = CONCAT('deleted_', id, '@deleted.local'),
        password = 'DELETED',
        data_processing_consent = FALSE,
        marketing_consent = FALSE,
        cookie_preferences = NULL
      WHERE id = ?
    `, [userId]);

    // Log the deletion
    await db.execute(`
      INSERT INTO system_logs (user_id, action, details, ip_address)
      VALUES (?, 'account_deletion', 'User requested account deletion', ?)
    `, [userId, req.ip]);

    // Destroy session
    req.session.destroy(() => {});

    res.json({ message: 'Account deletion completed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;