@echo off
REM ============================================================
REM Radio Wave Logger - Dev Environment Launcher
REM Emulator -> Expo Dev Server -> App Install
REM ============================================================

setlocal

set ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk
set EMULATOR=%ANDROID_SDK%\emulator\emulator.exe
set ADB=%ANDROID_SDK%\platform-tools\adb.exe
set AVD_NAME=Pixel_6_API_35
set PROJECT_DIR=%~dp0

echo [1/3] Starting emulator...
start "" "%EMULATOR%" -avd %AVD_NAME% -no-snapshot-load

echo Waiting for emulator to boot...
:WAIT_BOOT
"%ADB%" shell getprop sys.boot_completed 2>nul | findstr "1" >nul
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto WAIT_BOOT
)
echo Emulator is ready.

echo [2/3] Starting Expo dev server...
cd /d "%PROJECT_DIR%"
start "Expo Dev Server" cmd /k "npx expo start --android"

echo [3/3] Done! Expo will build and install the app.
echo.
echo   To stop:
echo     - Close this window
echo     - Press Ctrl+C in the Expo server window
echo     - Close the emulator
echo.
pause
