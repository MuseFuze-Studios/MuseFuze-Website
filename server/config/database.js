import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'MuseFuze_2025!',
  database: process.env.DB_NAME || 'musefuze_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const pool = mysql.createPool(dbConfig);

export async function initDatabase() {
  try {
    console.log('🔍 Initializing database connection...');
    
    // Test pool connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();

    // Create tables
    await createTables();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

async function createTables() {
  try {
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        role ENUM('user','dev_tester','developer','staff','admin','ceo') DEFAULT 'user',
        isActive BOOLEAN DEFAULT TRUE,
        cookiesAccepted BOOLEAN DEFAULT FALSE,
        data_processing_consent BOOLEAN DEFAULT FALSE,
        marketing_consent BOOLEAN DEFAULT FALSE,
        cookie_preferences JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);

    // Game builds table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS game_builds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        description TEXT,
        fileUrl VARCHAR(500),
        externalUrl VARCHAR(500),
        file_size BIGINT DEFAULT 0,
        uploaded_by INT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        test_instructions TEXT,
        known_issues TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_upload_date (upload_date)
      )
    `);

    // Bug reports table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bug_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'fixed', 'closed') DEFAULT 'open',
        tags JSON,
        build_id INT,
        reported_by INT,
        assigned_to INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE SET NULL,
        FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      )
    `);

    // Reviews table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        build_id INT,
        reviewer_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (build_id, reviewer_id)
      )
    `);

    // Message board posts table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS message_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        authorId INT NOT NULL,
        parentId INT NULL,
        isEdited BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parentId) REFERENCES message_posts(id) ON DELETE CASCADE,
        INDEX idx_author (authorId),
        INDEX idx_parent (parentId),
        INDEX idx_created (createdAt)
      )
    `);

    // Team announcements table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS team_announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author_id INT,
        is_sticky BOOLEAN DEFAULT FALSE,
        target_roles JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_sticky (is_sticky),
        INDEX idx_created (created_at)
      )
    `);

    // Playtest sessions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playtest_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        build_id INT,
        scheduled_date DATETIME NOT NULL,
        duration_minutes INT DEFAULT 60,
        max_participants INT DEFAULT 10,
        status ENUM('upcoming', 'in_progress', 'completed', 'cancelled') DEFAULT 'upcoming',
        location VARCHAR(255),
        test_focus VARCHAR(255),
        requirements TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_scheduled (scheduled_date),
        INDEX idx_status (status)
      )
    `);

    // Playtest RSVPs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playtest_rsvps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT,
        user_id INT,
        status ENUM('attending', 'maybe', 'not_attending') DEFAULT 'attending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES playtest_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_rsvp (session_id, user_id)
      )
    `);

    // Download history table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS download_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        build_id INT,
        user_id INT,
        download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        file_size BIGINT,
        download_duration INT,
        notes TEXT,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_download_date (download_date),
        INDEX idx_user (user_id)
      )
    `);

    // Finance transactions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description VARCHAR(200) NOT NULL,
        justification VARCHAR(500) NOT NULL,
        responsible_staff VARCHAR(100) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        INDEX idx_type (type),
        INDEX idx_date (date),
        INDEX idx_category (category)
      )
    `);

    // Finance budgets table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        allocated DECIMAL(10, 2) NOT NULL,
        spent DECIMAL(10, 2) DEFAULT 0.00,
        period ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
        year_period INT DEFAULT (YEAR(CURDATE())),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_period (period, year_period)
      )
    `);

    // Finance forecasts table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_forecasts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        month VARCHAR(20) NOT NULL,
        estimated DECIMAL(10, 2) NOT NULL,
        actual DECIMAL(10, 2) DEFAULT 0.00,
        year_period INT DEFAULT (YEAR(CURDATE())),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_month (month, year_period)
      )
    `);

    // Feature toggles table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS feature_toggles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feature_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // System logs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(100),
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_action (action),
        INDEX idx_created (created_at)
      )
    `);

    // User sessions table (for additional security tracking)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        sessionToken VARCHAR(255) NOT NULL,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (userId),
        INDEX idx_token (sessionToken),
        INDEX idx_expires (expiresAt)
      )
    `);

    // Seed initial data
    await seedInitialData();

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

async function seedInitialData() {
  try {
    // Check if admin user exists
    const [adminUsers] = await pool.execute(
      'SELECT id FROM users WHERE role = "admin" LIMIT 1'
    );

    if (adminUsers.length === 0) {
      // Create default admin user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 12);
      
      await pool.execute(
        'INSERT INTO users (email, password, firstName, lastName, role, cookiesAccepted) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@musefuze.com', hashedPassword, 'Admin', 'User', 'admin', true]
      );
      console.log('✅ Default admin user created (admin@musefuze.com / admin123)');
    }

    // Seed sample announcements
    const [announcements] = await pool.execute('SELECT id FROM team_announcements LIMIT 1');
    if (announcements.length === 0) {
      await pool.execute(`
        INSERT INTO team_announcements (title, content, author_id, is_sticky, target_roles)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'Welcome to MuseFuze Studios',
        'Welcome to the MuseFuze Studios staff dashboard! This is your central hub for development collaboration. Use the various tools to report bugs, submit reviews, and coordinate testing sessions.',
        1,
        true,
        JSON.stringify(['all'])
      ]);
      console.log('✅ Sample announcement created');
    }

    // Seed sample finance forecasts
    const [forecasts] = await pool.execute('SELECT id FROM finance_forecasts LIMIT 1');
    if (forecasts.length === 0) {
      const currentYear = new Date().getFullYear();
      const months = [
        { month: 'January', estimated: 5000, actual: 4800 },
        { month: 'February', estimated: 5500, actual: 5200 },
        { month: 'March', estimated: 6000, actual: 0 },
        { month: 'April', estimated: 6500, actual: 0 },
        { month: 'May', estimated: 7000, actual: 0 },
        { month: 'June', estimated: 7500, actual: 0 }
      ];

      for (const forecast of months) {
        await pool.execute(`
          INSERT INTO finance_forecasts (month, estimated, actual, year_period)
          VALUES (?, ?, ?, ?)
        `, [forecast.month, forecast.estimated, forecast.actual, currentYear]);
      }
      console.log('✅ Sample finance forecasts created');
    }

  } catch (error) {
    console.error('❌ Error seeding initial data:', error.message);
    // Don't throw here, as this is not critical
  }
}