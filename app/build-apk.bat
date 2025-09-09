@echo off
echo.
echo ========================================
echo        5WH Media APK Builder
echo ========================================
echo.

echo Checking requirements...

:: Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH
    echo Please install Java JDK 11 or higher
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)

:: Check if Android SDK is available
if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    if not exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
        echo [ERROR] Android SDK not found
        echo Please install Android Studio and set ANDROID_HOME
        echo Or download Android SDK from: https://developer.android.com/studio
        pause
        exit /b 1
    ) else (
        set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    )
)

echo [OK] Java found
echo [OK] Android SDK found
echo.

echo Building APK...
cd android
call gradlew assembleRelease

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo           BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK Location: android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo You can now install this APK on any Android device!
    echo.
) else (
    echo.
    echo ========================================
    echo            BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
