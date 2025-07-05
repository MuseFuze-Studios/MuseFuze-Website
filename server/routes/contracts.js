import express from 'express';
import handlebars from 'handlebars';
import { pool, ensureColumn } from '../config/database.js';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = express.Router();

async function logAction(contractId, action, message, userId, ip) {
  try {
    await pool.execute(
      `INSERT INTO contract_logs (user_contract_id, action, message, performed_by, ip_address) VALUES (?, ?, ?, ?, ?)`,
      [contractId, action, message, userId, ip]
    );
  } catch (err) {
    console.error('Log action error:', err);
  }
}

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
    const [result] = await pool.execute(
      'INSERT INTO user_contracts (user_id, template_id, assigned_by) VALUES (?, ?, ?)',
      [userId, templateId, req.user.id]
    );
    await logAction(result.insertId, 'assigned', null, req.user.id, req.ip);
    res.status(201).json({ message: 'Contract assigned' });
  } catch (err) {
    console.error('Assign contract error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function fetchUserContracts(userId) {
  const [rows] = await pool.execute(
    `SELECT uc.id, uc.status, uc.signed_at, uc.signed_name, uc.signed_ip,
            uc.is_active,
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
      is_active: row.is_active,
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

    await logAction(id, 'signed', `Signed by ${fullName}`, req.user.id, ip);

    res.json({ message: 'Contract signed' });
  } catch (err) {
    console.error('Sign contract error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contract history
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT cl.action, cl.message, cl.ip_address, cl.created_at, u.firstName, u.lastName
         FROM contract_logs cl
         LEFT JOIN users u ON cl.performed_by = u.id
        WHERE cl.user_contract_id = ?
        ORDER BY cl.created_at ASC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Get contract history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request contract change
router.post('/request', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { contractId, type, message } = req.body;

    // verify ownership
    const [rows] = await pool.execute(
      'SELECT id FROM user_contracts WHERE id=? AND user_id=?',
      [contractId, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    await pool.execute(
      `INSERT INTO contract_requests (user_contract_id, type, message) VALUES (?, ?, ?)`,
      [contractId, type, message]
    );

    await logAction(contractId, `${type}_requested`, message, req.user.id, req.ip);

    res.json({ message: 'Request submitted' });
  } catch (err) {
    console.error('Contract request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List contract requests for admin/ceo
router.get('/requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await ensureColumn('user_contracts', 'assigned_by', 'INT NULL');
    await ensureColumn('contract_requests', 'status', "ENUM('open','resolved') DEFAULT 'open'");
    await ensureColumn('contract_requests', 'resolved_by', 'INT NULL');
    await ensureColumn('contract_requests', 'resolved_at', 'TIMESTAMP NULL');
    let query = `
      SELECT cr.id, cr.type, cr.message, cr.created_at, cr.outcome, cr.notes,
             uc.id AS contract_id, uc.user_id, uc.assigned_by,
             u.firstName, u.lastName,
             ct.title
        FROM contract_requests cr
        JOIN user_contracts uc ON cr.user_contract_id = uc.id
        JOIN users u ON uc.user_id = u.id
        JOIN contract_templates ct ON uc.template_id = ct.id
        WHERE cr.status='open'`;
    const params = [];

    if (req.user.role === 'admin') {
      query += ' AND uc.assigned_by = ?';
      params.push(req.user.id);
    }

    if (req.query.type) {
      query += ' AND cr.type = ?';
      params.push(req.query.type);
    }

    query += ' ORDER BY cr.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('List contract requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/requests/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await ensureColumn('contract_requests', 'status', "ENUM('open','resolved') DEFAULT 'open'");
    await ensureColumn('contract_requests', 'resolved_by', 'INT NULL');
    await ensureColumn('contract_requests', 'resolved_at', 'TIMESTAMP NULL');
    await ensureColumn('contract_requests', 'outcome', "ENUM('approved','denied') DEFAULT 'approved'");
    await ensureColumn('contract_requests', 'notes', 'TEXT NULL');
    await ensureColumn('user_contracts', 'is_active', 'BOOLEAN DEFAULT TRUE');

    const [rows] = await pool.execute(
      `SELECT cr.status, cr.type, cr.user_contract_id, uc.user_id, uc.template_id
         FROM contract_requests cr
         JOIN user_contracts uc ON cr.user_contract_id = uc.id
        WHERE cr.id=?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = rows[0];

    if (request.status === 'resolved') {
      return res.json({ message: 'Already resolved' });
    }

    if (
      req.user.role === 'staff' &&
      req.user.id !== request.user_id
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (
      req.user.role !== 'staff' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'ceo'
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { outcome = 'approved', notes = '' } = req.body;

    await pool.execute(
      `UPDATE contract_requests
          SET status='resolved', outcome=?, notes=?, resolved_by=?, resolved_at=NOW()
        WHERE id=?`,
      [outcome, notes, req.user.id, id]
    );

    if (request.type === 'leave' && outcome === 'approved') {
      await pool.execute(
        'UPDATE user_contracts SET is_active=FALSE WHERE id=?',
        [request.user_contract_id]
      );
    }

    if (request.type === 'appeal' && outcome === 'approved') {
      await pool.execute(
        "UPDATE user_contracts SET status='pending' WHERE id=?",
        [request.user_contract_id]
      );
    }

    await logAction(
      request.user_contract_id,
      `request_${outcome}`,
      notes,
      req.user.id,
      req.ip
    );

    // notify user
    try {
      const [info] = await pool.execute(
        `SELECT u.email, u.firstName, ct.title
           FROM user_contracts uc
           JOIN users u ON uc.user_id = u.id
           JOIN contract_templates ct ON uc.template_id = ct.id
          WHERE uc.id=?`,
        [request.user_contract_id]
      );
      if (info.length) {
        const data = info[0];
        const html = `<p>Dear ${data.firstName}, your contract request has been ${outcome}. ${notes}</p>`;
        await sendEmail(data.email, `Contract Request ${outcome}`, html);
      }
    } catch (e) {
      console.error('Resolve request email error:', e);
    }

    res.json({ message: 'Request resolved' });
  } catch (err) {
    console.error('Resolve contract request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
