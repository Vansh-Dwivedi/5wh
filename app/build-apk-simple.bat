@echo off
echo.
echo ========================================
echo     5WH Media APK Builder (Simple)
echo ========================================
echo.

echo Choose your build method:
echo.
echo 1. Build with Expo (requires Expo account - FREE)
echo 2. Build locally (requires Android SDK)
echo 3. Export bundle only
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Building with Expo...
    echo Please login to your Expo account when prompted.
    echo If you don't have one, create free account at: https://expo.dev
    echo.
    pause
    npx eas login
    npx eas build --platform android --profile preview
    echo.
    echo APK will be available for download from the Expo dashboard!
) else if "%choice%"=="2" (
    echo.
    echo Building locally...
    call build-apk.bat
) else if "%choice%"=="3" (
    echo.
    echo Exporting app bundle...
    npx expo export --platform android --output-dir build-output
    echo.
    echo Bundle exported to: build-output
    echo This is not an APK, but contains all app files.
) else (
    echo Invalid choice!
)

echo.
pause
