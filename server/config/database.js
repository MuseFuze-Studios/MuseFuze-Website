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
        uploaded_by INT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isActive BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_upload_date (upload_date)
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