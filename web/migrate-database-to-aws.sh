#!/bin/bash

# Database Migration Script for AWS EC2
# This script transfers and imports your local database to AWS EC2

echo "🚀 Starting Database Migration to AWS EC2..."

# Configuration
EC2_USER="ubuntu"
EC2_HOST="ec2-16-52-123-203.ca-central-1.compute.amazonaws.com"
EC2_PATH="/home/ubuntu/5wh/web"
LOCAL_BACKUP_DIR="./database-backup"

echo "📦 Step 1: Creating database backup..."
if [ -d "$LOCAL_BACKUP_DIR" ]; then
    echo "✅ Backup directory exists"
else
    echo "❌ No backup found. Please run: node export-database.js"
    exit 1
fi

echo "📤 Step 2: Uploading database backup to EC2..."
# Create backup directory on EC2
ssh $EC2_USER@$EC2_HOST "mkdir -p $EC2_PATH/database-backup"

# Upload backup files
scp -r $LOCAL_BACKUP_DIR/* $EC2_USER@$EC2_HOST:$EC2_PATH/database-backup/

echo "📥 Step 3: Installing database import script on EC2..."
# Upload import script
scp import-database.js $EC2_USER@$EC2_HOST:$EC2_PATH/

echo "🔄 Step 4: Running import on EC2..."
# Run import script on EC2
ssh $EC2_USER@$EC2_HOST "cd $EC2_PATH && NODE_ENV=production node import-database.js"

echo "🧹 Step 5: Cleaning up..."
# Optional: Remove backup files from EC2 after import
ssh $EC2_USER@$EC2_HOST "rm -rf $EC2_PATH/database-backup"
ssh $EC2_USER@$EC2_HOST "rm $EC2_PATH/import-database.js"

echo "✅ Database migration completed!"
echo "🔗 Your data is now available on: http://$EC2_HOST:5000"
