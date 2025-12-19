@echo off
chcp 65001 >nul
color 0A
title Aplikasi Bengkel Motor - Menu Akses Mudah

:MENU
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🔧 APLIKASI BENGKEL MOTOR - MENU AKSES MUDAH 🔧     ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │  PILIH OPSI:                                               │
echo ├────────────────────────────────────────────────────────────┤
echo │                                                            │
echo │  1. 🚀 Buka Aplikasi (Browser Normal)                      │
echo │  2. 📺 Buka Aplikasi (Mode Fullscreen/Kiosk)               │
echo │  3. 🔖 Buat Shortcut di Desktop                            │
echo │  4. 🌐 Setup Domain Lokal (bengkel.local)                  │
echo │  5. 📱 Generate QR Code (Akses dari Mobile)                │
echo │  6. 📄 Buka Halaman Panduan Akses                          │
echo │  7. ℹ️  Lihat Informasi Koneksi                            │
echo │  0. ❌ Keluar                                               │
echo │                                                            │
echo └────────────────────────────────────────────────────────────┘
echo.
set /p choice="Masukkan pilihan (0-7): "

if "%choice%"=="1" goto OPEN_NORMAL
if "%choice%"=="2" goto OPEN_FULLSCREEN
if "%choice%"=="3" goto CREATE_SHORTCUT
if "%choice%"=="4" goto SETUP_DOMAIN
if "%choice%"=="5" goto GENERATE_QR
if "%choice%"=="6" goto OPEN_GUIDE
if "%choice%"=="7" goto SHOW_INFO
if "%choice%"=="0" goto EXIT

echo.
echo ❌ Pilihan tidak valid! Silakan pilih 0-7.
timeout /t 2 >nul
goto MENU

:OPEN_NORMAL
cls
echo ════════════════════════════════════════════════════════════
echo  🚀 Membuka Aplikasi...
echo ════════════════════════════════════════════════════════════
echo.
call buka-bengkel-chrome.bat
timeout /t 2 >nul
goto MENU

:OPEN_FULLSCREEN
cls
echo ════════════════════════════════════════════════════════════
echo  📺 Membuka Aplikasi dalam Mode Fullscreen...
echo ════════════════════════════════════════════════════════════
echo.
echo  Tekan F11 atau Alt+F4 untuk keluar dari fullscreen
echo.
call buka-bengkel-fullscreen.bat
timeout /t 2 >nul
goto MENU

:CREATE_SHORTCUT
cls
echo ════════════════════════════════════════════════════════════
echo  🔖 Membuat Shortcut Desktop...
echo ════════════════════════════════════════════════════════════
echo.
call buat-shortcut-client.bat
echo.
echo  ✓ Shortcut berhasil dibuat di Desktop!
echo.
pause
goto MENU

:SETUP_DOMAIN
cls
echo ════════════════════════════════════════════════════════════
echo  🌐 Setup Domain Lokal
echo ════════════════════════════════════════════════════════════
echo.
echo  PERHATIAN: Memerlukan akses Administrator!
echo.
echo  Script akan membuka jendela baru dengan hak Administrator.
echo  Ikuti instruksi di jendela tersebut.
echo.
pause
powershell -Command "Start-Process 'setup-domain-lokal.bat' -Verb RunAs"
echo.
echo  ✓ Script setup domain lokal telah dijalankan.
echo.
pause
goto MENU

:GENERATE_QR
cls
echo ════════════════════════════════════════════════════════════
echo  📱 Generate QR Code
echo ════════════════════════════════════════════════════════════
echo.
echo  Membuka halaman QR Code Generator...
echo.
echo  Anda bisa:
echo   • Scan QR Code dari smartphone/tablet
echo   • Download QR Code sebagai gambar
echo   • Cetak QR Code untuk ditempel
echo   • Konfigurasi IP server jika berbeda
echo.
call buka-qr-code.bat
echo.
pause
goto MENU

:OPEN_GUIDE
cls
echo ════════════════════════════════════════════════════════════
echo  📄 Membuka Halaman Panduan...
echo ════════════════════════════════════════════════════════════
echo.
start akses-aplikasi.html
timeout /t 2 >nul
goto MENU

:SHOW_INFO
cls
echo ════════════════════════════════════════════════════════════
echo  ℹ️  INFORMASI KONEKSI
echo ════════════════════════════════════════════════════════════
echo.
echo  📍 IP Address Komputer Ini:
echo  ────────────────────────────────────────────────────────────
ipconfig | findstr /i "IPv4"
echo.
echo  ────────────────────────────────────────────────────────────
echo  🌐 URL Akses Aplikasi (Default):
echo     http://192.168.1.100:5173
echo.
echo  📝 Catatan:
echo     - Ganti IP di atas dengan IP server yang sebenarnya
echo     - Port Frontend: 5173
echo     - Port Backend: 3001
echo.
echo  🔧 Cara Cek IP Server:
echo     1. Buka Command Prompt di komputer server
echo     2. Ketik: ipconfig
echo     3. Lihat IPv4 Address
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
goto MENU

:EXIT
cls
echo ════════════════════════════════════════════════════════════
echo  👋 Terima kasih telah menggunakan Aplikasi Bengkel Motor!
echo ════════════════════════════════════════════════════════════
echo.
timeout /t 2 >nul
exit

