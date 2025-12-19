@echo off
chcp 65001 >nul
color 0E
title QR Code Generator - Aplikasi Bengkel Motor

cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        📱 QR CODE GENERATOR - APLIKASI BENGKEL MOTOR 📱    ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo  Membuka halaman QR Code Generator...
echo.
echo  Halaman ini akan menampilkan QR Code yang bisa di-scan
echo  dari smartphone atau tablet untuk akses cepat ke aplikasi.
echo.
echo ════════════════════════════════════════════════════════════
echo.

REM Buka halaman QR Code
start qr-code-akses.html

echo  ✓ Halaman QR Code telah dibuka di browser!
echo.
echo  📋 Yang bisa Anda lakukan:
echo   • Scan QR Code dari smartphone/tablet
echo   • Download QR Code sebagai gambar
echo   • Cetak QR Code untuk ditempel
echo   • Konfigurasi IP server jika berbeda
echo.
echo ════════════════════════════════════════════════════════════
echo.
