# Build and Package Script for 5WH Media (PowerShell)
# This script creates a deployment-ready package for Windows users

Write-Host "🔨 Building 5WH Media for production deployment..." -ForegroundColor Green

# Configuration
$PackageName = "5wh-media-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$BuildDir = ".\build-output"

# Create build directory
Write-Host "[INFO] Creating build directory..." -ForegroundColor Green
if (Test-Path $BuildDir) {
    Remove-Item -Recurse -Force $BuildDir
}
New-Item -ItemType Directory -Path $BuildDir | Out-Null

# Build React application
Write-Host "[INFO] Building React application..." -ForegroundColor Green
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ React build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Create deployment package (using 7-Zip if available, otherwise PowerShell compression)
Write-Host "[INFO] Creating deployment package..." -ForegroundColor Green

$ExcludeItems = @(
    "node_modules",
    "client\node_modules",
    ".git",
    ".gitignore",
    "*.log",
    "logs",
    ".env",
    ".env.local",
    ".env.development",
    "README.md",
    "*.md",
    ".vscode",
    ".idea",
    "*.tar.gz",
    "build-output"
)

# Copy files to temporary directory excluding unwanted items
$TempDir = ".\temp-package"
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy all files except excluded ones
Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_.FullName
    $shouldExclude = $false
    foreach ($exclude in $ExcludeItems) {
        if ($item -like "*$exclude*") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destinationPath = Join-Path $TempDir $relativePath
    $destinationDir = Split-Path $destinationPath -Parent
    
    if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }
    
    if ($_.PSIsContainer -eq $false) {
        Copy-Item $_.FullName $destinationPath -Force
    }
}

# Create ZIP archive
$ArchivePath = Join-Path $BuildDir "$PackageName.zip"
Compress-Archive -Path "$TempDir\*" -DestinationPath $ArchivePath -Force

# Clean up temporary directory
Remove-Item -Recurse -Force $TempDir

# Generate checksum
Write-Host "[INFO] Generating checksums..." -ForegroundColor Green
$Hash = Get-FileHash -Path $ArchivePath -Algorithm SHA256
$Hash.Hash | Out-File -FilePath (Join-Path $BuildDir "$PackageName.sha256") -Encoding ASCII

# Display results
Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "📦 Package: $ArchivePath" -ForegroundColor Cyan
Write-Host "🔐 Checksum: $(Join-Path $BuildDir "$PackageName.sha256")" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps for AWS deployment:" -ForegroundColor Yellow
Write-Host "1. Upload the ZIP package to your AWS EC2 instance"
Write-Host "2. Follow the instructions in DEPLOYMENT.md"
Write-Host "3. Extract and deploy the package on your server"
Write-Host ""
$Size = (Get-Item $ArchivePath).Length / 1MB
Write-Host "Package size: $([math]::Round($Size, 2)) MB"
