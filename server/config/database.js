import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'musefuze_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

export let pool;

export async function initDatabase() {
  try {
    console.log('🗄️  Initializing database connection...');
    
    // Create connection pool
    pool = mysql.createPool(DB_CONFIG);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Create tables
    await createTables();
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createDatabaseIfNotExists() {
  try {
    const tempConfig = { ...DB_CONFIG };
    delete tempConfig.database;
    
    const tempPool = mysql.createPool(tempConfig);
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    await tempPool.end();
    
    console.log(`✅ Database '${DB_CONFIG.database}' ready`);
  } catch (error) {
    console.error('❌ Error creating database:', error);
    throw error;
  }
}

async function createTables() {
  try {
    console.log('📋 Creating database tables...');
    
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        role ENUM('user', 'dev_tester', 'developer', 'staff', 'admin', 'ceo') DEFAULT 'user',
        cookiesAccepted BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        data_processing_consent BOOLEAN DEFAULT FALSE,
        marketing_consent BOOLEAN DEFAULT FALSE,
        cookie_preferences JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Game builds table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS game_builds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        description TEXT,
        file_path VARCHAR(500),
        file_size BIGINT DEFAULT 0,
        external_url VARCHAR(500),
        test_instructions TEXT,
        known_issues TEXT,
        uploaded_by INT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isActive BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
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
        build_id INT,
        tags JSON,
        reported_by INT NOT NULL,
        assigned_to INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE SET NULL,
        FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Reviews table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        build_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (build_id, reviewer_id)
      )
    `);

    // Message posts table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS message_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        authorId INT NOT NULL,
        parentId INT,
        isEdited BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parentId) REFERENCES message_posts(id) ON DELETE CASCADE
      )
    `);

    // Team announcements table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS team_announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        is_sticky BOOLEAN DEFAULT FALSE,
        target_roles JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Playtest sessions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playtest_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        build_id INT NOT NULL,
        scheduled_date DATETIME NOT NULL,
        duration_minutes INT NOT NULL,
        max_participants INT NOT NULL,
        location VARCHAR(255),
        test_focus VARCHAR(255),
        requirements TEXT,
        status ENUM('upcoming', 'in_progress', 'completed', 'cancelled') DEFAULT 'upcoming',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Playtest RSVPs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playtest_rsvps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('attending', 'maybe', 'not_attending') NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES playtest_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_rsvp (session_id, user_id)
      )
    `);

    // Download history table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS download_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        build_id INT NOT NULL,
        user_id INT NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        download_duration INT,
        notes TEXT,
        file_size BIGINT DEFAULT 0,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Finance transactions table (UK-focused)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GBP',
        vat_rate DECIMAL(5, 2) DEFAULT 20.00,
        vat_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount * vat_rate / 100) STORED,
        description VARCHAR(200) NOT NULL,
        justification TEXT NOT NULL,
        receipt_path VARCHAR(500),
        responsible_staff_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        hmrc_category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (responsible_staff_id) REFERENCES users(id) ON DELETE RESTRICT
      )
    `);

    // Finance budgets table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        allocated DECIMAL(10, 2) NOT NULL,
        spent DECIMAL(10, 2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'GBP',
        period ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
        fiscal_year INT DEFAULT (YEAR(CURDATE())),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Finance forecasts table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_forecasts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        month VARCHAR(20) NOT NULL,
        estimated DECIMAL(10, 2) NOT NULL,
        actual DECIMAL(10, 2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'GBP',
        fiscal_year INT DEFAULT (YEAR(CURDATE())),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert ONLY the default admin user if not exists
    await pool.execute(`
      INSERT IGNORE INTO users (email, password, firstName, lastName, role, cookiesAccepted, isActive)
      VALUES (
        'admin@musefuze.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/HK',
        'Admin',
        'User',
        'admin',
        TRUE,
        TRUE
      )
    `);

    // Insert default announcement
    await pool.execute(`
      INSERT IGNORE INTO team_announcements (id, title, content, author_id, is_sticky, target_roles)
      VALUES (
        1,
        'Welcome to the Staff Dashboard',
        'This is your central hub for development collaboration. Use the various tools to report bugs, submit reviews, and coordinate testing sessions.',
        1,
        TRUE,
        '["all"]'
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

export { pool };