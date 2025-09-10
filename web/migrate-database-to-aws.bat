@echo off
echo ===========================================
echo  Database Migration to AWS EC2
echo ===========================================

set EC2_USER=ubuntu
set EC2_HOST=ec2-16-52-123-203.ca-central-1.compute.amazonaws.com
set EC2_PATH=/home/ubuntu/5wh/web

echo Step 1: Checking database backup...
if not exist database-backup\ (
    echo ERROR: No backup found. Please run: node export-database.js
    pause
    exit /b 1
)
echo Found backup directory!

echo.
echo Step 2: Uploading files to EC2...
ssh %EC2_USER%@%EC2_HOST% "mkdir -p %EC2_PATH%/database-backup"
scp -r database-backup\* %EC2_USER%@%EC2_HOST%:%EC2_PATH%/database-backup/
if %errorlevel% neq 0 (
    echo ERROR: Failed to upload files
    pause
    exit /b 1
)

echo.
echo Step 3: Uploading import script...
scp import-database.js %EC2_USER%@%EC2_HOST%:%EC2_PATH%/
if %errorlevel% neq 0 (
    echo ERROR: Failed to upload import script
    pause
    exit /b 1
)

echo.
echo Step 4: Running import on EC2...
ssh %EC2_USER%@%EC2_HOST% "cd %EC2_PATH% && NODE_ENV=production node import-database.js"

echo.
echo Step 5: Cleanup...
ssh %EC2_USER%@%EC2_HOST% "rm -rf %EC2_PATH%/database-backup"
ssh %EC2_USER%@%EC2_HOST% "rm %EC2_PATH%/import-database.js"

echo.
echo ===========================================
echo  Migration Complete!
echo  Your app: http://%EC2_HOST%:5000
echo ===========================================
pause
