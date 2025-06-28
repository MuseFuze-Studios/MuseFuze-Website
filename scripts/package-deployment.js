import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function packageDeployment() {
  console.log('📦 Packaging deployment...');
  
  const deployDir = path.join(rootDir, 'deployment');
  const zipPath = path.join(rootDir, 'musefuze-deployment.zip');
  
  try {
    // Clean previous deployment
    await fs.remove(deployDir);
    await fs.remove(zipPath);
    
    // Create deployment directory structure
    await fs.ensureDir(deployDir);
    await fs.ensureDir(path.join(deployDir, 'public'));
    await fs.ensureDir(path.join(deployDir, 'server'));
    await fs.ensureDir(path.join(deployDir, 'uploads'));
    
    // Copy built frontend
    await fs.copy(path.join(rootDir, 'dist'), path.join(deployDir, 'public'));
    
    // Copy built server
    await fs.copy(path.join(rootDir, 'dist-server'), path.join(deployDir, 'server'));
    
    // Copy essential files
    const filesToCopy = [
      'package.json',
      '.env.example',
      'README.md'
    ];
    
    for (const file of filesToCopy) {
      if (await fs.pathExists(path.join(rootDir, file))) {
        await fs.copy(path.join(rootDir, file), path.join(deployDir, file));
      }
    }
    
    // Create production package.json
    const originalPackage = await fs.readJson(path.join(rootDir, 'package.json'));
    const productionPackage = {
      name: originalPackage.name,
      version: originalPackage.version,
      type: "module",
      scripts: {
        start: "NODE_ENV=production node server/index.js",
        "setup:db": "node server/scripts/setup-database.js"
      },
      dependencies: {
        express: originalPackage.devDependencies.express,
        mysql2: originalPackage.devDependencies.mysql2,
        bcryptjs: originalPackage.devDependencies.bcryptjs,
        jsonwebtoken: originalPackage.devDependencies.jsonwebtoken,
        'cookie-parser': originalPackage.devDependencies['cookie-parser'],
        cors: originalPackage.devDependencies.cors,
        helmet: originalPackage.devDependencies.helmet,
        'express-rate-limit': originalPackage.devDependencies['express-rate-limit'],
        'express-validator': originalPackage.devDependencies['express-validator'],
        multer: originalPackage.devDependencies.multer,
        dotenv: originalPackage.devDependencies.dotenv
      }
    };
    
    await fs.writeJson(path.join(deployDir, 'package.json'), productionPackage, { spaces: 2 });
    
    // Create deployment scripts
    await createDeploymentScripts(deployDir);
    
    // Create ZIP file
    await createZipFile(deployDir, zipPath);
    
    console.log('✅ Deployment package created: musefuze-deployment.zip');
    console.log('📁 Deployment folder created: deployment/');
    
  } catch (error) {
    console.error('❌ Packaging failed:', error);
    process.exit(1);
  }
}

async function createDeploymentScripts(deployDir) {
  // Create start script
  const startScript = `#!/bin/bash
echo "🚀 Starting MuseFuze Studios..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Start the application
echo "🌟 Starting application..."
npm start
`;

  await fs.writeFile(path.join(deployDir, 'start.sh'), startScript);
  await fs.chmod(path.join(deployDir, 'start.sh'), '755');

  // Create setup script
  const setupScript = `#!/bin/bash
echo "🔧 Setting up MuseFuze Studios..."

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install --production

# Setup database (if configured)
if [ -f .env ]; then
    echo "🗄️  Setting up database..."
    npm run setup:db
else
    echo "⚠️  Please configure .env file before running database setup"
fi

echo "✅ Setup complete! Run ./start.sh to start the application"
`;

  await fs.writeFile(path.join(deployDir, 'setup.sh'), setupScript);
  await fs.chmod(path.join(deployDir, 'setup.sh'), '755');

  // Create systemd service file
  const serviceFile = `[Unit]
Description=MuseFuze Studios Web Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/musefuze
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

  await fs.writeFile(path.join(deployDir, 'musefuze.service'), serviceFile);

  // Create nginx configuration
  const nginxConfig = `server {
    listen 80;
    server_name musefuzestudios.com www.musefuzestudios.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name musefuzestudios.com www.musefuzestudios.com;
    
    # SSL Configuration (update paths to your certificates)
    ssl_certificate /etc/ssl/certs/musefuzestudios.com.crt;
    ssl_certificate_key /etc/ssl/private/musefuzestudios.com.key;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # API routes - proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://musefuzestudios.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }
    
    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location / {
        root /var/www/musefuze/public;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Security - block sensitive files
    location ~ /\\. {
        deny all;
    }
    
    location ~ \\.(env|git|htaccess|htpasswd)$ {
        deny all;
    }
}
`;

  await fs.writeFile(path.join(deployDir, 'nginx.conf'), nginxConfig);

  // Create deployment README
  const deploymentReadme = `# MuseFuze Studios - Production Deployment

## Quick Start

1. **Upload and extract** the deployment package to your server
2. **Configure environment** by copying .env.example to .env
3. **Run setup**: \`./setup.sh\`
4. **Start application**: \`./start.sh\`

## Detailed Setup Instructions

### 1. Server Requirements

- **Node.js** 18+ 
- **MySQL** 8.0+
- **Nginx** (recommended)
- **SSL Certificate** (Let's Encrypt recommended)

### 2. Upload Files

\`\`\`bash
# Upload the deployment package
scp musefuze-deployment.zip user@your-server:/var/www/
ssh user@your-server
cd /var/www
unzip musefuze-deployment.zip
mv deployment musefuze
cd musefuze
\`\`\`

### 3. Configure Environment

\`\`\`bash
# Copy and edit environment file
cp .env.example .env
nano .env
\`\`\`

**Required Environment Variables:**
\`\`\`
NODE_ENV=production
PORT=5000
CLIENT_URL=https://musefuzestudios.com

# Database
DB_HOST=localhost
DB_USER=musefuze_user
DB_PASSWORD=your_secure_password
DB_NAME=musefuze_db

# Security
JWT_SECRET=your_super_secure_jwt_secret_here
BCRYPT_ROUNDS=12
\`\`\`

### 4. Database Setup

\`\`\`bash
# Create database and user
mysql -u root -p
CREATE DATABASE musefuze_db;
CREATE USER 'musefuze_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON musefuze_db.* TO 'musefuze_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
\`\`\`

### 5. Install and Setup

\`\`\`bash
# Run setup script
./setup.sh
\`\`\`

### 6. Configure Nginx (Recommended)

\`\`\`bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/musefuze
sudo ln -s /etc/nginx/sites-available/musefuze /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

### 7. Setup SSL Certificate

\`\`\`bash
# Using Let's Encrypt (recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d musefuzestudios.com -d www.musefuzestudios.com
\`\`\`

### 8. Setup Systemd Service (Optional)

\`\`\`bash
# Copy service file
sudo cp musefuze.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable musefuze
sudo systemctl start musefuze
sudo systemctl status musefuze
\`\`\`

## Manual Start

If you prefer to run manually:

\`\`\`bash
# Start the application
./start.sh

# Or directly with Node.js
npm start
\`\`\`

## Monitoring

\`\`\`bash
# Check application status
curl http://localhost:5000/api/health

# Check logs (if using systemd)
sudo journalctl -u musefuze -f

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
\`\`\`

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   - Change PORT in .env file
   - Update nginx.conf accordingly

2. **Database connection failed**
   - Verify MySQL is running
   - Check database credentials in .env
   - Ensure database and user exist

3. **Permission denied**
   - Check file permissions: \`chmod +x start.sh setup.sh\`
   - Ensure www-data user has access to files

4. **CORS errors**
   - Verify CLIENT_URL in .env matches your domain
   - Check nginx CORS headers configuration

### File Permissions

\`\`\`bash
# Set correct permissions
sudo chown -R www-data:www-data /var/www/musefuze
sudo chmod -R 755 /var/www/musefuze
sudo chmod +x /var/www/musefuze/start.sh
sudo chmod +x /var/www/musefuze/setup.sh
\`\`\`

## Security Checklist

- ✅ Strong JWT secret (32+ characters)
- ✅ Secure database password
- ✅ SSL certificate installed
- ✅ Firewall configured (ports 80, 443, 22)
- ✅ Regular backups scheduled
- ✅ Keep Node.js and dependencies updated

## Support

For issues, check the logs and verify configuration. The application should be accessible at:
- **Frontend**: https://musefuzestudios.com
- **API Health**: https://musefuzestudios.com/api/health
`;

  await fs.writeFile(path.join(deployDir, 'DEPLOYMENT.md'), deploymentReadme);
}

async function createZipFile(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`📦 Archive created: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

packageDeployment();