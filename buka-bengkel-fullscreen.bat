@echo off
REM ============================================
REM   Buka Aplikasi Bengkel dalam Mode Fullscreen
REM ============================================

REM Ganti dengan IP server Anda
set IP_SERVER=192.168.1.100
set PORT=5173
set APP_URL=http://%IP_SERVER%:%PORT%

REM Coba buka dengan Chrome terlebih dahulu
where chrome >nul 2>&1
if %errorLevel% equ 0 (
    start chrome --kiosk "%APP_URL%"
    exit /b 0
)

REM Jika Chrome tidak ada, coba Edge
where msedge >nul 2>&1
if %errorLevel% equ 0 (
    start msedge --kiosk "%APP_URL%"
    exit /b 0
)

REM Jika keduanya tidak ada, buka dengan browser default (tidak fullscreen)
echo Chrome dan Edge tidak ditemukan.
echo Membuka dengan browser default...
start "" "%APP_URL%"
