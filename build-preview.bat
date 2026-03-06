@echo off
REM ============================================================
REM Radio Wave Logger - EAS Preview Build (Android APK)
REM ============================================================

setlocal

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo ============================================================
echo  Radio Wave Logger - Android Preview Build
echo ============================================================
echo.

echo [1/2] Starting EAS build (preview profile)...
echo   - Platform: Android
echo   - Output: APK
echo   - This may take several minutes.
echo.

call eas build --platform android --profile preview

if errorlevel 1 (
    echo.
    echo ERROR: Build failed. Check the logs above.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  Build complete!
echo  Scan the QR code above or open the link to install.
echo ============================================================
echo.
pause
