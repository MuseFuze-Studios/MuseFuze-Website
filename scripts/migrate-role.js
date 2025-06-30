import { pool } from '../server/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    console.log('🔄 Checking role column...');
    const [columns] = await pool.execute("SHOW COLUMNS FROM users LIKE 'role'");
    if (columns.length === 0) {
      console.log('➕ Adding role column to users table');
      await pool.execute(
        "ALTER TABLE users ADD COLUMN role ENUM('user','dev_tester','developer','staff','admin','ceo') DEFAULT 'user' NOT NULL AFTER lastName"
      );
    } else {
      console.log('✅ Role column already exists');
    }

    console.log('🔄 Updating existing rows');
    await pool.execute(
      "UPDATE users SET role='staff' WHERE isStaff = TRUE AND (role IS NULL OR role='')"
    );
    await pool.execute(
      "UPDATE users SET role='user' WHERE role IS NULL OR role = ''"
    );

    console.log('✅ Migration complete');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();