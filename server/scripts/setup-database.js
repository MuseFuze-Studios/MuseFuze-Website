import { initDatabase } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  console.log('🗄️  Setting up database...');
  
  try {
    await initDatabase();
    console.log('✅ Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();