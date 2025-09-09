#!/bin/bash

# Build and Package Script for 5WH Media
# This script creates a deployment-ready package

echo "🔨 Building 5WH Media for production deployment..."

# Configuration
PACKAGE_NAME="5wh-media-$(date +%Y%m%d-%H%M%S)"
BUILD_DIR="./build-output"
EXCLUDE_FILES=(
    "node_modules"
    "client/node_modules"
    ".git"
    ".gitignore"
    "*.log"
    "logs/*"
    ".env"
    ".env.local"
    ".env.development"
    "README.md"
    "*.md"
    ".vscode"
    ".idea"
    "*.tar.gz"
    "build-output"
)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create build directory
print_status "Creating build directory..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Build React application
print_status "Building React application..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ React build failed!"
    exit 1
fi
cd ..

# Create exclude pattern for tar
EXCLUDE_PATTERN=""
for item in "${EXCLUDE_FILES[@]}"; do
    EXCLUDE_PATTERN="$EXCLUDE_PATTERN --exclude=$item"
done

# Create deployment package
print_status "Creating deployment package..."
tar -czf "$BUILD_DIR/$PACKAGE_NAME.tar.gz" $EXCLUDE_PATTERN .

# Create checksums
print_status "Generating checksums..."
cd $BUILD_DIR
sha256sum "$PACKAGE_NAME.tar.gz" > "$PACKAGE_NAME.sha256"
cd ..

# Display results
echo ""
print_status "✅ Build completed successfully!"
echo "📦 Package: $BUILD_DIR/$PACKAGE_NAME.tar.gz"
echo "🔐 Checksum: $BUILD_DIR/$PACKAGE_NAME.sha256"
echo ""
print_warning "Next steps for AWS deployment:"
echo "1. Upload the package to your AWS EC2 instance"
echo "2. Follow the instructions in DEPLOYMENT.md"
echo "3. Extract and deploy the package on your server"
echo ""
echo "Package size: $(ls -lh $BUILD_DIR/$PACKAGE_NAME.tar.gz | awk '{print $5}')"
