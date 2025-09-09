#!/bin/bash

# AWS Deployment Script for 5WH Media
# This script deploys your application to AWS EC2 instance

echo "🚀 Starting 5WH Media deployment to AWS..."

# Configuration
APP_NAME="5wh-media"
DEPLOY_DIR="/var/www/5wh-media"
BACKUP_DIR="/var/backups/5wh-media"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo privileges"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js and npm if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# Install MongoDB if not present
if ! command -v mongod &> /dev/null; then
    print_status "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# Create application directory
print_status "Setting up application directory..."
mkdir -p $DEPLOY_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/uploads/5wh
mkdir -p /var/www/5wh-media/logs

# Set permissions
chown -R www-data:www-data /var/www/5wh-media
chown -R www-data:www-data /var/uploads/5wh
chmod -R 755 /var/www/5wh-media
chmod -R 755 /var/uploads/5wh

print_status "✅ AWS deployment script completed successfully!"
print_warning "Next steps:"
echo "1. Upload your application files to ${DEPLOY_DIR}"
echo "2. Copy .env.production to .env in the deployment directory"
echo "3. Run: cd ${DEPLOY_DIR} && npm install --production"
echo "4. Run: pm2 start ecosystem.config.js --env production"
echo "5. Configure Nginx reverse proxy"
echo "6. Setup SSL certificate with Let's Encrypt"
