# Database Migration Script for AWS EC2 (PowerShell)
# This script transfers and imports your local database to AWS EC2

Write-Host "🚀 Starting Database Migration to AWS EC2..." -ForegroundColor Green

# Configuration
$EC2_USER = "ubuntu"
$EC2_HOST = "ec2-16-52-123-203.ca-central-1.compute.amazonaws.com"
$EC2_PATH = "/home/ubuntu/5wh/web"
$LOCAL_BACKUP_DIR = ".\database-backup"

Write-Host "📦 Step 1: Checking database backup..." -ForegroundColor Yellow
if (Test-Path $LOCAL_BACKUP_DIR) {
    Write-Host "✅ Backup directory exists" -ForegroundColor Green
    $files = Get-ChildItem $LOCAL_BACKUP_DIR
    Write-Host "Found $($files.Count) backup files" -ForegroundColor Cyan
} else {
    Write-Host "❌ No backup found. Please run: node export-database.js" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Step 2: Uploading database backup to EC2..." -ForegroundColor Yellow
try {
    # Create backup directory on EC2
    ssh $EC2_USER@$EC2_HOST "mkdir -p $EC2_PATH/database-backup"
    
    # Upload backup files
    scp -r $LOCAL_BACKUP_DIR/* ${EC2_USER}@${EC2_HOST}:${EC2_PATH}/database-backup/
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error uploading files: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "📥 Step 3: Installing database import script on EC2..." -ForegroundColor Yellow
try {
    # Upload import script
    scp import-database.js ${EC2_USER}@${EC2_HOST}:${EC2_PATH}/
    Write-Host "✅ Import script uploaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Error uploading import script: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Step 4: Running import on EC2..." -ForegroundColor Yellow
try {
    # Run import script on EC2
    ssh $EC2_USER@$EC2_HOST "cd $EC2_PATH && NODE_ENV=production node import-database.js"
    Write-Host "✅ Database imported successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during import: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🧹 Step 5: Cleaning up..." -ForegroundColor Yellow
try {
    # Optional: Remove backup files from EC2 after import
    ssh $EC2_USER@$EC2_HOST "rm -rf $EC2_PATH/database-backup"
    ssh $EC2_USER@$EC2_HOST "rm $EC2_PATH/import-database.js"
    Write-Host "✅ Cleanup completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Cleanup warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "🎉 Database migration completed!" -ForegroundColor Green
Write-Host "🔗 Your data is now available on: http://$EC2_HOST:5000" -ForegroundColor Cyan

# Test connection
Write-Host "🧪 Testing connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$EC2_HOST:5000/api/news" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is responding correctly!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Server test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}
