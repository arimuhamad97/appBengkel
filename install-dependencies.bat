@echo off
echo ========================================
echo   Install Dependencies (node_modules)
echo ========================================
echo.
echo Script ini akan install ulang semua
echo dependencies yang diperlukan aplikasi.
echo.
echo Tunggu proses selesai...
echo (Biasanya 2-5 menit tergantung internet)
echo.
pause

echo.
echo [INFO] Installing dependencies...
echo.

call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   INSTALL COMPLETE!
    echo ========================================
    echo.
    echo Dependencies berhasil di-install.
    echo Aplikasi siap dijalankan!
    echo.
    echo Jalankan aplikasi dengan:
    echo   start-app.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   INSTALL FAILED!
    echo ========================================
    echo.
    echo Terjadi error saat install dependencies.
    echo.
    echo Coba solusi berikut:
    echo.
    echo 1. Check koneksi internet
    echo 2. Jalankan Command Prompt as Administrator
    echo 3. Atau jalankan manual: npm install
    echo.
)

pause
