import mysql from 'mysql2/promise';

let connection: mysql.Connection;

export const connectDB = async () => {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'musefuze_studios'
    });

    console.log('📊 MySQL Connected');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const getDB = () => connection;

const createTables = async () => {
  try {
    // Users table with updated roles
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'dev_tester', 'developer', 'staff', 'admin', 'ceo') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        cookie_preferences JSON,
        data_processing_consent BOOLEAN DEFAULT FALSE,
        marketing_consent BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP NULL
      )
    `);

    // Game builds table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS game_builds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        test_instructions TEXT,
        known_issues TEXT,
        uploaded_by INT,
        is_active BOOLEAN DEFAULT true,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `);

    // Bug reports table with enhanced tracking
    await connection.execute(`
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
        FOREIGN KEY (build_id) REFERENCES game_builds(id),
        FOREIGN KEY (reported_by) REFERENCES users(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);

    // Reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        build_id INT,
        reviewer_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id),
        FOREIGN KEY (reviewer_id) REFERENCES users(id)
      )
    `);

    // Feature toggles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS feature_toggles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feature_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // System logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Team announcements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS team_announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author_id INT,
        is_sticky BOOLEAN DEFAULT FALSE,
        target_roles JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);

    // Playtest sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS playtest_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        build_id INT,
        scheduled_date DATETIME NOT NULL,
        duration_minutes INT DEFAULT 60,
        max_participants INT DEFAULT 10,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (build_id) REFERENCES game_builds(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Playtest RSVPs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS playtest_rsvps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT,
        user_id INT,
        status ENUM('attending', 'maybe', 'not_attending') DEFAULT 'attending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES playtest_sessions(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_rsvp (session_id, user_id)
      )
    `);

    // Download history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS download_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        build_id INT,
        user_id INT,
        download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        FOREIGN KEY (build_id) REFERENCES game_builds(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Legal documents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS legal_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_type ENUM('privacy_policy', 'terms_of_service', 'cookie_policy', 'gdpr_notice') NOT NULL,
        version VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        effective_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // User consent log table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_consent_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        consent_type ENUM('data_processing', 'marketing', 'cookies') NOT NULL,
        consent_given BOOLEAN NOT NULL,
        document_version VARCHAR(20),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('📋 Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};