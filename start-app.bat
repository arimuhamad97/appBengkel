@echo off
echo ========================================
echo   APLIKASI BENGKEL MOTOR - MUTIARA
echo ========================================
echo.

:: 1. Start Backend Server
echo [1/2] Memulai Backend Server (Port 3001)...
start "Bengkel Backend" cmd /k "cd /d %~dp0server && node index.js"

:: Tunggu 3 detik agar backend siap
timeout /t 3 /nobreak >nul

:: 2. Start Frontend (menggunakan node langsung untuk menghindari masalah PowerShell)
echo [2/2] Memulai Frontend (Port 5173)...
start "Bengkel Frontend" cmd /k "cd /d %~dp0 && node node_modules/vite/bin/vite.js --host"

:: Tunggu 2 detik agar frontend siap
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   APLIKASI SUDAH BERJALAN!
echo ========================================
echo.
echo Akses dari komputer ini:
echo   http://localhost:5173
echo.
echo Akses dari komputer/HP lain (LAN):
echo   http://10.153.235.45:5173
echo.
echo CATATAN: Jangan tutup jendela terminal yang muncul!
echo          Tutup jendela ini saja jika sudah selesai.
echo ========================================
echo.
pause
