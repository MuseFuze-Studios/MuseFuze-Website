import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
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
    
    // Seed initial data
    await seedInitialData();
    
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
        version VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_size BIGINT DEFAULT 0,
        fileUrl VARCHAR(500),
        externalUrl VARCHAR(500),
        test_instructions TEXT,
        known_issues TEXT,
        uploaded_by INT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isActive BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_upload_date (upload_date)
      )
    `);

    // Announcements table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        is_sticky BOOLEAN DEFAULT FALSE,
        target_roles JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_author (author_id),
        INDEX idx_created (created_at)
      )
    `);

    // Bug reports table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bug_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low','medium','high','critical') DEFAULT 'medium',
        status ENUM('open','in_progress','fixed','closed') DEFAULT 'open',
        tags JSON,
        build_id INT NULL,
        reported_by INT NOT NULL,
        assigned_to INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE SET NULL,
        INDEX idx_reported_by (reported_by),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      )
    `);

    // Build reviews table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS build_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        build_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT NOT NULL,
        reviewer_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_build (build_id),
        INDEX idx_reviewer (reviewer_id),
        INDEX idx_rating (rating)
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

    // Playtest sessions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playtest_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        build_id INT NOT NULL,
        scheduled_date DATETIME NOT NULL,
        duration_minutes INT DEFAULT 60,
        max_participants INT DEFAULT 10,
        location VARCHAR(255),
        test_focus VARCHAR(255),
        requirements TEXT,
        status ENUM('upcoming','in_progress','completed','cancelled') DEFAULT 'upcoming',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_build (build_id),
        INDEX idx_created_by (created_by),
        INDEX idx_scheduled (scheduled_date)
      )
    `);

    // Playtest RSVPs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playtest_rsvps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('attending','maybe','not_attending') NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES playtest_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_session_user (session_id, user_id),
        INDEX idx_session (session_id),
        INDEX idx_user (user_id)
      )
    `);

    // Download history table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS download_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        build_id INT NOT NULL,
        download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        download_duration INT,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (build_id) REFERENCES game_builds(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_build (build_id),
        INDEX idx_date (download_date)
      )
    `);

    // Finance transactions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('income','expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255) NOT NULL,
        justification TEXT NOT NULL,
        responsible_staff_id INT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending','approved','rejected') DEFAULT 'approved',
        FOREIGN KEY (responsible_staff_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_type (type),
        INDEX idx_category (category),
        INDEX idx_date (date),
        INDEX idx_staff (responsible_staff_id)
      )
    `);

    // Finance budgets table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        allocated DECIMAL(10,2) NOT NULL,
        spent DECIMAL(10,2) DEFAULT 0,
        period ENUM('monthly','quarterly','yearly') NOT NULL,
        year INT DEFAULT YEAR(CURDATE()),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_period (period),
        INDEX idx_year (year)
      )
    `);

    // Finance forecasts table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS finance_forecasts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        month VARCHAR(20) NOT NULL,
        year INT DEFAULT YEAR(CURDATE()),
        estimated DECIMAL(10,2) NOT NULL,
        actual DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_month_year (month, year)
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
      'SELECT id FROM users WHERE email = ?',
      ['admin@musefuze.com']
    );

    if (adminUsers.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const [adminResult] = await pool.execute(
        'INSERT INTO users (email, password, firstName, lastName, role, cookiesAccepted) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@musefuze.com', hashedPassword, 'Admin', 'User', 'admin', true]
      );

      const adminId = adminResult.insertId;

      // Create sample game build
      const [buildResult] = await pool.execute(
        'INSERT INTO game_builds (version, title, description, file_size, test_instructions, known_issues, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          '0.1.0',
          'Alpha Build - Initial Release',
          'First playable build with basic mechanics',
          1024 * 1024 * 50, // 50MB
          'Test basic movement and interaction systems',
          'Some UI elements may not scale properly on different resolutions',
          adminId
        ]
      );

      // Create welcome announcement
      await pool.execute(
        'INSERT INTO announcements (title, content, author_id, is_sticky, target_roles) VALUES (?, ?, ?, ?, ?)',
        [
          'Welcome to the Staff Dashboard',
          'This is your central hub for development collaboration. Use the various tools to report bugs, submit reviews, and coordinate testing sessions.',
          adminId,
          true,
          JSON.stringify(['all'])
        ]
      );

      // Create sample forecast data
      const forecastData = [
        { month: 'January', estimated: 5000, actual: 4800 },
        { month: 'February', estimated: 5500, actual: 5200 },
        { month: 'March', estimated: 6000, actual: 0 }
      ];

      for (const forecast of forecastData) {
        await pool.execute(
          'INSERT INTO finance_forecasts (month, estimated, actual) VALUES (?, ?, ?)',
          [forecast.month, forecast.estimated, forecast.actual]
        );
      }

      console.log('✅ Initial data seeded successfully');
      console.log('🔑 Admin user created: admin@musefuze.com / password123');
    } else {
      console.log('✅ Admin user already exists, skipping seed data');
    }
  } catch (error) {
    console.error('❌ Error seeding initial data:', error.message);
    throw error;
  }
}