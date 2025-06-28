# MuseFuze Studios - Production Deployment

## Quick Start

1. **Upload and extract** the deployment package to your server
2. **Configure environment** by copying .env.example to .env
3. **Run setup**: `./setup.sh`
4. **Start application**: `./start.sh`

## Detailed Setup Instructions

### 1. Server Requirements

- **Node.js** 18+ 
- **MySQL** 8.0+
- **Nginx** (recommended)
- **SSL Certificate** (Let's Encrypt recommended)

### 2. Upload Files

```bash
# Upload the deployment package
scp musefuze-deployment.zip user@your-server:/var/www/
ssh user@your-server
cd /var/www
unzip musefuze-deployment.zip
mv deployment musefuze
cd musefuze
```

### 3. Configure Environment

```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

**Required Environment Variables:**
```
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
```

### 4. Database Setup

```bash
# Create database and user
mysql -u root -p
CREATE DATABASE musefuze_db;
CREATE USER 'musefuze_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON musefuze_db.* TO 'musefuze_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Install and Setup

```bash
# Run setup script
./setup.sh
```

### 6. Configure Nginx (Recommended)

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/musefuze
sudo ln -s /etc/nginx/sites-available/musefuze /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL Certificate

```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d musefuzestudios.com -d www.musefuzestudios.com
```

### 8. Setup Systemd Service (Optional)

```bash
# Copy service file
sudo cp musefuze.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable musefuze
sudo systemctl start musefuze
sudo systemctl status musefuze
```

## Manual Start

If you prefer to run manually:

```bash
# Start the application
./start.sh

# Or directly with Node.js
npm start
```

## Monitoring

```bash
# Check application status
curl http://localhost:5000/api/health

# Check logs (if using systemd)
sudo journalctl -u musefuze -f

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

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
   - Check file permissions: `chmod +x start.sh setup.sh`
   - Ensure www-data user has access to files

4. **CORS errors**
   - Verify CLIENT_URL in .env matches your domain
   - Check nginx CORS headers configuration

### File Permissions

```bash
# Set correct permissions
sudo chown -R www-data:www-data /var/www/musefuze
sudo chmod -R 755 /var/www/musefuze
sudo chmod +x /var/www/musefuze/start.sh
sudo chmod +x /var/www/musefuze/setup.sh
```

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
