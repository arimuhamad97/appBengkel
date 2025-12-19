@echo off
echo ============================================
echo   Setup Domain Lokal untuk Aplikasi Bengkel
echo ============================================
echo.
echo PERHATIAN: Script ini memerlukan akses Administrator!
echo.
echo Script ini akan menambahkan entry ke file hosts Windows
echo sehingga aplikasi bisa diakses dengan nama domain lokal
echo seperti: http://bengkel.local:5173
echo.
echo ============================================
echo.

REM Cek apakah dijalankan sebagai Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Script ini harus dijalankan sebagai Administrator!
    echo.
    echo Cara menjalankan sebagai Administrator:
    echo 1. Klik kanan file ini
    echo 2. Pilih "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Ganti dengan IP server Anda
set IP_SERVER=192.168.1.100
set DOMAIN_NAME=bengkel.local

REM Lokasi file hosts
set HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts

echo Menambahkan entry ke file hosts...
echo.

REM Cek apakah entry sudah ada
findstr /C:"%DOMAIN_NAME%" "%HOSTS_FILE%" >nul
if %errorLevel% equ 0 (
    echo Entry "%DOMAIN_NAME%" sudah ada di file hosts.
    echo Tidak perlu menambahkan lagi.
) else (
    REM Tambahkan entry baru
    echo. >> "%HOSTS_FILE%"
    echo # Entry untuk Aplikasi Bengkel Motor >> "%HOSTS_FILE%"
    echo %IP_SERVER%  %DOMAIN_NAME% >> "%HOSTS_FILE%"
    echo Entry berhasil ditambahkan!
)

echo.
echo ============================================
echo   Setup selesai!
echo ============================================
echo.
echo Aplikasi sekarang bisa diakses dengan:
echo   http://%DOMAIN_NAME%:5173
echo.
echo Catatan: Anda perlu menjalankan script ini di
echo setiap komputer client yang ingin mengakses
echo aplikasi dengan nama domain.
echo.
echo ============================================
echo.
pause
