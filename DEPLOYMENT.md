# 🚀 VPS Deployment Guide

This guide will help you deploy MuseFuze Studios to your own VPS server as a single, self-contained application.

## 📋 Prerequisites

### Server Requirements
- **Ubuntu 20.04+** or **CentOS 8+**
- **Node.js 18+**
- **MySQL 8.0+**
- **Nginx** (recommended)
- **2GB+ RAM**
- **20GB+ storage**

### Domain Setup
- Domain pointing to your server IP
- SSL certificate (Let's Encrypt recommended)

## 🏗️ Build and Package

### 1. Prepare for Deployment

```bash
# Install additional dependencies for packaging
npm install archiver fs-extra --save-dev

# Setup production environment
npm run setup:production

# Edit the production environment file
cp .env.production .env
nano .env
```

### 2. Build Complete Package

```bash
# Build everything and create deployment package
npm run deploy:vps
```

This creates:
- `musefuze-deployment.zip` - Complete deployment package
- `deployment/` - Extracted deployment folder

## 📦 Server Deployment

### 1. Upload to Server

```bash
# Upload the deployment package
scp musefuze-deployment.zip user@your-server:/var/www/

# Connect to server
ssh user@your-server
cd /var/www
sudo unzip musefuze-deployment.zip
sudo mv deployment musefuze
sudo chown -R www-data:www-data musefuze
cd musefuze
```

### 2. Configure Environment

```bash
# Edit environment variables
sudo nano .env
```

**Required Settings:**
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

# Database
DB_HOST=localhost
DB_USER=musefuze_user
DB_PASSWORD=your_secure_password
DB_NAME=musefuze_db

# Security
JWT_SECRET=your_super_secure_jwt_secret_here
```

### 3. Database Setup

```bash
# Create database
sudo mysql -u root -p
```

```sql
CREATE DATABASE musefuze_db;
CREATE USER 'musefuze_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON musefuze_db.* TO 'musefuze_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Install and Setup

```bash
# Run the setup script
sudo ./setup.sh
```

### 5. Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/musefuze
sudo ln -s /etc/nginx/sites-available/musefuze /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6. Setup SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7. Setup System Service

```bash
# Install systemd service
sudo cp musefuze.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable musefuze
sudo systemctl start musefuze

# Check status
sudo systemctl status musefuze
```

## 🔧 Manual Start (Alternative)

If you prefer not to use systemd:

```bash
# Start manually
./start.sh

# Or with PM2 (install first: npm install -g pm2)
pm2 start server/index.js --name musefuze
pm2 startup
pm2 save
```

## ✅ Verification

### 1. Check Application

```bash
# Test API health
curl http://localhost:5000/api/health

# Test from outside
curl https://yourdomain.com/api/health
```

### 2. Check Frontend

Visit `https://yourdomain.com` in your browser.

### 3. Check Logs

```bash
# Application logs (systemd)
sudo journalctl -u musefuze -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Updates

To update your deployment:

1. **Build new package** on development machine:
   ```bash
   npm run deploy:vps
   ```

2. **Upload and replace** on server:
   ```bash
   scp musefuze-deployment.zip user@server:/tmp/
   ssh user@server
   sudo systemctl stop musefuze
   cd /var/www
   sudo cp musefuze/.env /tmp/backup.env
   sudo rm -rf musefuze
   sudo unzip /tmp/musefuze-deployment.zip
   sudo mv deployment musefuze
   sudo cp /tmp/backup.env musefuze/.env
   sudo chown -R www-data:www-data musefuze
   cd musefuze
   sudo ./setup.sh
   sudo systemctl start musefuze
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **Port 5000 in use**
   ```bash
   sudo lsof -i :5000
   # Change PORT in .env if needed
   ```

2. **Database connection failed**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Test connection
   mysql -u musefuze_user -p musefuze_db
   ```

3. **Permission errors**
   ```bash
   sudo chown -R www-data:www-data /var/www/musefuze
   sudo chmod +x /var/www/musefuze/start.sh
   ```

4. **Nginx errors**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Performance Optimization

```bash
# Enable gzip in nginx
sudo nano /etc/nginx/nginx.conf

# Add to http block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## 🔒 Security Checklist

- ✅ Strong database passwords
- ✅ Secure JWT secret (32+ characters)
- ✅ SSL certificate installed
- ✅ Firewall configured (UFW recommended)
- ✅ Regular security updates
- ✅ Backup strategy in place

## 📊 Monitoring

### Basic Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check application status
sudo systemctl status musefuze
```

### Log Rotation

```bash
# Setup log rotation for application logs
sudo nano /etc/logrotate.d/musefuze
```

```
/var/log/musefuze/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload musefuze
    endscript
}
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `sudo journalctl -u musefuze -f`
2. Verify configuration: `curl http://localhost:5000/api/health`
3. Check nginx: `sudo nginx -t`
4. Review environment variables in `.env`

Your application should now be running at `https://yourdomain.com`!