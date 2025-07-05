import express from 'express';
import handlebars from 'handlebars';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = express.Router();

// Create contract template
router.post('/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO contract_templates (title, content, created_by) VALUES (?, ?, ?)',
      [title, content, req.user.id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List templates
router.get('/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM contract_templates ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('List templates error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign contract to user
router.post('/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, templateId } = req.body;
    await pool.execute(
      'INSERT INTO user_contracts (user_id, template_id) VALUES (?, ?)',
      [userId, templateId]
    );
    res.status(201).json({ message: 'Contract assigned' });
  } catch (err) {
    console.error('Assign contract error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function fetchUserContracts(userId) {
  const [rows] = await pool.execute(
    `SELECT uc.id, uc.status, uc.signed_at, uc.signed_name, uc.signed_ip,
            ct.title, ct.content,
            u.firstName, u.lastName, u.email
       FROM user_contracts uc
       JOIN contract_templates ct ON uc.template_id = ct.id
       JOIN users u ON uc.user_id = u.id
       WHERE uc.user_id = ?
       ORDER BY uc.created_at DESC`,
    [userId]
  );

  return rows.map((row) => {
    const template = handlebars.compile(row.content);
    const compiled = template({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
    });
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      signed_at: row.signed_at,
      signed_name: row.signed_name,
      signed_ip: row.signed_ip,
      content: compiled,
    };
  });
}

// Get contracts for current user
router.get('/user', authenticateToken, requireStaff, async (req, res) => {
  try {
    const contracts = await fetchUserContracts(req.user.id);
    res.json(contracts);
  } catch (err) {
    console.error('Get user contracts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contracts for specified user (admin)
router.get('/user/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contracts = await fetchUserContracts(req.params.id);
    res.json(contracts);
  } catch (err) {
    console.error('Get contracts admin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign contract
router.post('/sign/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName } = req.body;
    const ip = req.ip;

    const [result] = await pool.execute(
      `UPDATE user_contracts SET status='signed', signed_at=NOW(), signed_name=?, signed_ip=?
       WHERE id=? AND user_id=?`,
      [fullName, ip, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Send confirmation email
    try {
      const [rows] = await pool.execute(
        `SELECT ct.title, ct.content, u.email, u.firstName
           FROM user_contracts uc
           JOIN contract_templates ct ON uc.template_id=ct.id
           JOIN users u ON uc.user_id=u.id
          WHERE uc.id=?`,
        [id]
      );
      if (rows.length) {
        const data = rows[0];
        const template = handlebars.compile(data.content);
        const html = template({ firstName: data.firstName, email: data.email });
        await sendEmail(data.email, `Contract Signed: ${data.title}`, html);
      }
    } catch (e) {
      console.error('Contract email error:', e);
    }

    res.json({ message: 'Contract signed' });
  } catch (err) {
    console.error('Sign contract error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
