@echo off
REM ============================================================
REM Radio Wave Logger - 開発環境ワンクリック起動
REM エミュレータ起動 → Expo開発サーバー起動 → アプリインストール
REM ============================================================

setlocal

set ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk
set EMULATOR=%ANDROID_SDK%\emulator\emulator.exe
set ADB=%ANDROID_SDK%\platform-tools\adb.exe
set AVD_NAME=Pixel_6_API_35
set PROJECT_DIR=%~dp0

echo [1/3] エミュレータを起動しています...
start "" "%EMULATOR%" -avd %AVD_NAME% -no-snapshot-load

echo エミュレータの起動を待機中...
:WAIT_BOOT
"%ADB%" shell getprop sys.boot_completed 2>nul | findstr "1" >nul
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto WAIT_BOOT
)
echo エミュレータが起動しました。

echo [2/3] Expo開発サーバーを起動しています...
cd /d "%PROJECT_DIR%"
start "Expo Dev Server" cmd /k "npx expo start --android"

echo [3/3] 完了！Expo開発サーバーがアプリをビルド・インストールします。
echo.
echo   終了するには:
echo     - このウィンドウを閉じる
echo     - Expoサーバーのウィンドウで Ctrl+C
echo     - エミュレータを閉じる
echo.
pause
