@echo off
echo ============================================
echo   Membuat Shortcut Desktop Aplikasi Bengkel
echo ============================================
echo.

REM Ganti IP_SERVER dengan IP komputer server Anda
set IP_SERVER=192.168.1.100
set PORT=5173

REM Lokasi Desktop
set DESKTOP=%USERPROFILE%\Desktop

REM Buat file VBS untuk membuat shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%DESKTOP%\Bengkel Motor.url" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "http://%IP_SERVER%:%PORT%" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM Jalankan VBS script
cscript CreateShortcut.vbs

REM Hapus file VBS temporary
del CreateShortcut.vbs

echo.
echo ============================================
echo   Shortcut berhasil dibuat di Desktop!
echo   Nama: "Bengkel Motor"
echo   URL: http://%IP_SERVER%:%PORT%
echo ============================================
echo.
echo Tekan tombol apa saja untuk keluar...
pause > nul
