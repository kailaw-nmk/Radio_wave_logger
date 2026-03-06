@echo off
REM ============================================================
REM Radio Wave Logger - Dev Environment Launcher
REM Port Check -> Emulator -> Expo Go Check -> Expo Dev Server
REM ============================================================

setlocal

set ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk
set EMULATOR=%ANDROID_SDK%\emulator\emulator.exe
set ADB=%ANDROID_SDK%\platform-tools\adb.exe
set AVD_NAME=Pixel_6_API_35
set PROJECT_DIR=%~dp0
set EXPO_PORT=8081

echo [1/4] Checking port %EXPO_PORT%...
set PID_FOUND=
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":%EXPO_PORT% "') do (
    set PID_FOUND=%%a
)
if defined PID_FOUND (
    echo Port %EXPO_PORT% is in use by PID %PID_FOUND%. Killing process...
    taskkill /PID %PID_FOUND% /F >nul 2>&1
    if errorlevel 1 (
        echo WARNING: Failed to kill PID %PID_FOUND%. Port may still be in use.
    ) else (
        echo Port %EXPO_PORT% released.
    )
) else (
    echo Port %EXPO_PORT% is available.
)

echo [2/4] Starting emulator...
start "" "%EMULATOR%" -avd %AVD_NAME% -no-snapshot-load

echo Waiting for emulator to boot...
:WAIT_BOOT
"%ADB%" shell getprop sys.boot_completed 2>nul | findstr "1" >nul
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto WAIT_BOOT
)
echo Emulator is ready.

echo [3/4] Checking Expo Go...
"%ADB%" shell pm list packages 2>nul | findstr "host.exp.exponent" >nul
if errorlevel 1 (
    echo Expo Go is not installed. It will be installed automatically.
) else (
    echo Expo Go is installed.
)

echo [4/4] Starting Expo dev server...
cd /d "%PROJECT_DIR%"
start "Expo Dev Server" cmd /k "npx expo start --android"

echo.
echo Done! Expo will build and install the app.
echo.
echo   To stop:
echo     - Close this window
echo     - Press Ctrl+C in the Expo server window
echo     - Close the emulator
echo.
pause
