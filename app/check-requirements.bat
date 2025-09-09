@echo off
echo.
echo ========================================
echo     Installation Verification
echo ========================================
echo.

echo Checking Java...
java -version
if %errorlevel% neq 0 (
    echo [ERROR] Java not found
    exit /b 1
) else (
    echo [OK] Java is installed
)

echo.
echo Checking Android SDK...
adb version
if %errorlevel% neq 0 (
    echo [ERROR] Android SDK not found
    exit /b 1
) else (
    echo [OK] Android SDK is installed
)

echo.
echo Checking Gradle...
if exist "android\gradlew.bat" (
    echo [OK] Gradle wrapper found
) else (
    echo [ERROR] Gradle wrapper not found
    exit /b 1
)

echo.
echo ========================================
echo    ALL REQUIREMENTS SATISFIED!
echo ========================================
echo.
echo You can now build the APK using:
echo   1. Double-click: build-apk.bat
echo   2. Or run: cd android && gradlew assembleRelease
echo.

pause
