import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function buildServer() {
  console.log('🏗️  Building server for production...');
  
  const serverSrcDir = path.join(rootDir, 'server');
  const serverDistDir = path.join(rootDir, 'dist-server');
  
  try {
    // Clean previous build
    await fs.remove(serverDistDir);
    
    // Copy server files
    await fs.copy(serverSrcDir, serverDistDir);
    
    // Create uploads directory
    await fs.ensureDir(path.join(serverDistDir, 'uploads'));
    
    console.log('✅ Server build completed');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();