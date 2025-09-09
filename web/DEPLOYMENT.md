# 5WH Media - AWS Deployment Guide

## Prerequisites
- AWS EC2 instance (Ubuntu 20.04 LTS or later)
- Domain name pointed to your EC2 instance
- SSH access to your server

## Quick Deployment Steps

### 1. Prepare Your AWS EC2 Instance
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-server-ip

# Run the deployment script
sudo bash deploy-aws.sh
```

### 2. Upload Your Application
```bash
# On your local machine, create deployment package
tar -czf 5wh-media.tar.gz --exclude=node_modules --exclude=client/node_modules --exclude=.git .

# Upload to server
scp -i your-key.pem 5wh-media.tar.gz ubuntu@your-server-ip:/tmp/

# On server, extract files
cd /var/www/5wh-media
sudo tar -xzf /tmp/5wh-media.tar.gz
sudo chown -R www-data:www-data /var/www/5wh-media
```

### 3. Configure Environment
```bash
# Copy production environment file
sudo cp .env.production .env

# Edit environment variables
sudo nano .env
# Update MONGODB_URI, JWT_SECRET, and other sensitive values
```

### 4. Install Dependencies and Build
```bash
cd /var/www/5wh-media

# Install server dependencies
sudo -u www-data npm install --production

# Build React app (if not already built)
sudo -u www-data npm run build
```

### 5. Configure MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user (optional but recommended)
mongo
> use 5wh_media_prod
> db.createUser({
    user: "5wh_user",
    pwd: "secure_password_here",
    roles: [{ role: "readWrite", db: "5wh_media_prod" }]
})
> exit
```

### 6. Start Application with PM2
```bash
cd /var/www/5wh-media
sudo -u www-data pm2 start ecosystem.config.js --env production

# Save PM2 configuration
sudo -u www-data pm2 save
sudo -u www-data pm2 startup
```

### 7. Configure Nginx
```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/5wh-media

# Update domain name in the config
sudo nano /etc/nginx/sites-available/5wh-media
# Replace 'your-domain.com' with your actual domain

# Enable the site
sudo ln -s /etc/nginx/sites-available/5wh-media /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 8. Setup SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 9. Configure Firewall
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Environment Variables to Update

In your `.env` file, make sure to update these values:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/5wh_media_prod
JWT_SECRET=your_super_secure_jwt_secret_key_here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
CORS_ORIGIN=https://yourdomain.com
```

## API Endpoints for Mobile App

Your API endpoints will be available at:

### Public Endpoints:
- `GET https://yourdomain.com/api/news` - Get news articles
- `GET https://yourdomain.com/api/opinions` - Get opinions
- `GET https://yourdomain.com/api/lifeculture/books` - Get book recommendations
- `GET https://yourdomain.com/api/lifeculture/cultural-events` - Get cultural events
- `GET https://yourdomain.com/api/videos` - Get videos
- `GET https://yourdomain.com/api/podcasts` - Get podcasts

### App-Specific Endpoints:
- `GET https://yourdomain.com/app/fetch/news` - Mobile optimized news
- `GET https://yourdomain.com/app/fetch/videos` - Mobile optimized videos
- `GET https://yourdomain.com/app/fetch/podcasts` - Mobile optimized podcasts

## Monitoring and Maintenance

### Check Application Status
```bash
# Check PM2 status
sudo -u www-data pm2 status

# Check logs
sudo -u www-data pm2 logs

# Restart application
sudo -u www-data pm2 restart 5wh-media
```

### Check Services
```bash
# Check Nginx
sudo systemctl status nginx

# Check MongoDB
sudo systemctl status mongod

# Check system resources
htop
```

### Backup Database
```bash
# Create backup
mongodump --db 5wh_media_prod --out /var/backups/5wh-media/$(date +%Y%m%d)

# Restore backup
mongorestore --db 5wh_media_prod /var/backups/5wh-media/20241201/5wh_media_prod/
```

## Security Considerations

1. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
2. **Use strong passwords** for database and admin accounts
3. **Enable fail2ban**: `sudo apt install fail2ban -y`
4. **Regular backups**: Set up automated database backups
5. **Monitor logs**: Check application and system logs regularly
6. **Update dependencies**: Keep npm packages updated

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
sudo -u www-data pm2 logs

# Check if port is in use
sudo netstat -tulpn | grep :3000

# Restart services
sudo systemctl restart nginx
sudo -u www-data pm2 restart all
```

### Database connection issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

## Performance Optimization

1. **Enable Gzip compression** (already configured in Nginx)
2. **Use CDN** for static assets
3. **Implement caching** for API responses
4. **Monitor performance** with PM2 monitoring
5. **Optimize MongoDB** with appropriate indexes

Your 5WH Media application is now ready for production on AWS!
