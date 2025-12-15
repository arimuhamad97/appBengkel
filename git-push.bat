@echo off
echo ========================================
echo   Git Push to GitHub
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git tidak terinstall!
    echo.
    echo Silakan install Git dari: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

REM Check git status
echo [INFO] Checking git status...
git status

echo.
echo ========================================
echo Pilih Aksi:
echo ========================================
echo 1. Initialize Git (Pertama kali)
echo 2. Commit dan Push perubahan
echo 3. Pull update dari GitHub
echo 4. View status
echo 5. Exit
echo ========================================
echo.

set /p choice="Pilihan (1-5): "

if "%choice%"=="1" goto :init
if "%choice%"=="2" goto :push
if "%choice%"=="3" goto :pull
if "%choice%"=="4" goto :status
if "%choice%"=="5" goto :end

echo [ERROR] Pilihan tidak valid!
pause
exit /b 1

:init
echo.
echo ========================================
echo   Initialize Git Repository
echo ========================================
echo.

REM Initialize git
git init
echo [OK] Git repository initialized

REM Add remote
git remote add origin https://github.com/arimuhamad97/appBengkel.git
echo [OK] Remote origin added

REM Add all files
git add .
echo [OK] Files added

REM Initial commit
set /p commit_msg="Commit message (default: Initial commit): "
if "%commit_msg%"=="" set commit_msg=Initial commit: Complete workshop management system

git commit -m "%commit_msg%"
echo [OK] Files committed

REM Push to main
git branch -M main
git push -u origin main
echo [OK] Pushed to GitHub

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Repository: https://github.com/arimuhamad97/appBengkel
echo.
pause
goto :end

:push
echo.
echo ========================================
echo   Commit and Push Changes
echo ========================================
echo.

REM Show changes
git status

echo.
set /p confirm="Lanjutkan commit? (y/n): "
if /i not "%confirm%"=="y" goto :end

REM Add all changes
git add .
echo [OK] Changes staged

REM Commit
set /p commit_msg="Commit message: "
if "%commit_msg%"=="" (
    echo [ERROR] Commit message tidak boleh kosong!
    pause
    goto :end
)

git commit -m "%commit_msg%"
echo [OK] Changes committed

REM Pull first (to avoid conflicts)
echo.
echo [INFO] Pulling latest changes...
git pull origin main --rebase

REM Push
echo.
echo [INFO] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   PUSH COMPLETE!
echo ========================================
echo.
pause
goto :end

:pull
echo.
echo ========================================
echo   Pull Updates from GitHub
echo ========================================
echo.

REM Stash local changes
echo [INFO] Saving local changes...
git stash

REM Pull latest
echo [INFO] Pulling from GitHub...
git pull origin main

REM Apply stashed changes
echo [INFO] Restoring local changes...
git stash pop

echo.
echo [OK] Update complete!
echo.
echo NOTE: Jika ada perubahan di server/, restart backend:
echo   1. Ctrl+C di terminal server
echo   2. Jalankan: node index.js
echo.
echo Frontend otomatis reload (HMR)
echo.
pause
goto :end

:status
echo.
echo ========================================
echo   Git Status
echo ========================================
echo.

git status
git log --oneline -10

echo.
pause
goto :end

:end
echo.
echo Terima kasih!
echo.
