@echo off
chcp 65001 >nul
color 0B
title Konfigurasi IP Server - Aplikasi Bengkel Motor

cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     🔧 KONFIGURASI IP SERVER - APLIKASI BENGKEL MOTOR 🔧   ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo  Tool ini akan membantu Anda mengubah IP server di semua
echo  file akses mudah secara otomatis.
echo.
echo ════════════════════════════════════════════════════════════
echo  📍 IP ADDRESS KOMPUTER INI:
echo ════════════════════════════════════════════════════════════
ipconfig | findstr /i "IPv4"
echo ════════════════════════════════════════════════════════════
echo.
echo  IP Server saat ini di file: 192.168.1.100
echo.
set /p new_ip="Masukkan IP Server yang baru (contoh: 192.168.1.50): "

if "%new_ip%"=="" (
    echo.
    echo ❌ IP tidak boleh kosong!
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo  🔄 Mengupdate IP di semua file...
echo ════════════════════════════════════════════════════════════
echo.

REM Update semua file .bat
echo  📝 Updating buka-bengkel-chrome.bat...
powershell -Command "(gc buka-bengkel-chrome.bat) -replace '192.168.1.100', '%new_ip%' | Out-File -encoding ASCII buka-bengkel-chrome.bat"

echo  📝 Updating buka-bengkel-edge.bat...
powershell -Command "(gc buka-bengkel-edge.bat) -replace '192.168.1.100', '%new_ip%' | Out-File -encoding ASCII buka-bengkel-edge.bat"

echo  📝 Updating buka-bengkel-fullscreen.bat...
powershell -Command "(gc buka-bengkel-fullscreen.bat) -replace '192.168.1.100', '%new_ip%' | Out-File -encoding ASCII buka-bengkel-fullscreen.bat"

echo  📝 Updating buat-shortcut-client.bat...
powershell -Command "(gc buat-shortcut-client.bat) -replace '192.168.1.100', '%new_ip%' | Out-File -encoding ASCII buat-shortcut-client.bat"

echo  📝 Updating setup-domain-lokal.bat...
powershell -Command "(gc setup-domain-lokal.bat) -replace '192.168.1.100', '%new_ip%' | Out-File -encoding ASCII setup-domain-lokal.bat"

echo  📝 Updating akses-aplikasi.html...
powershell -Command "(gc akses-aplikasi.html) -replace '192.168.1.100', '%new_ip%' | Out-File -encoding UTF8 akses-aplikasi.html"

echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ UPDATE SELESAI!
echo ════════════════════════════════════════════════════════════
echo.
echo  IP Server telah diubah dari 192.168.1.100 ke %new_ip%
echo.
echo  File yang telah diupdate:
echo   ✓ buka-bengkel-chrome.bat
echo   ✓ buka-bengkel-edge.bat
echo   ✓ buka-bengkel-fullscreen.bat
echo   ✓ buat-shortcut-client.bat
echo   ✓ setup-domain-lokal.bat
echo   ✓ akses-aplikasi.html
echo.
echo  Sekarang Anda bisa menggunakan file-file tersebut dengan
echo  IP server yang baru.
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
