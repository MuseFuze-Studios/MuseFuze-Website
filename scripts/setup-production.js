import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function setupProduction() {
  console.log('🔧 Setting up production environment...');
  
  try {
    // Check if .env exists
    const envPath = path.join(rootDir, '.env');
    if (!await fs.pathExists(envPath)) {
      console.log('⚠️  .env file not found. Creating from .env.example...');
      await fs.copy(path.join(rootDir, '.env.example'), envPath);
      console.log('📝 Please edit .env file with your production settings');
    }
    
    // Create uploads directory
    const uploadsDir = path.join(rootDir, 'server', 'uploads');
    await fs.ensureDir(uploadsDir);
    console.log('📁 Uploads directory created');
    
    // Set proper permissions (Unix-like systems)
    if (process.platform !== 'win32') {
      try {
        await fs.chmod(uploadsDir, '755');
        console.log('🔒 Permissions set for uploads directory');
      } catch (error) {
        console.log('⚠️  Could not set permissions (may need sudo)');
      }
    }
    
    console.log('✅ Production setup completed');
    console.log('');
    console.log('Next steps:');
    console.log('1. Edit .env file with your production settings');
    console.log('2. Set up your MySQL database');
    console.log('3. Run: npm run deploy:vps');
    console.log('4. Upload musefuze-deployment.zip to your server');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupProduction();