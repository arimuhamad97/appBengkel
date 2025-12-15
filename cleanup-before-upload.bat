@echo off
echo ========================================
echo   Persiapan Upload ke GitHub
echo ========================================
echo.
echo Script ini akan menghapus file-file yang
echo TIDAK PERLU di-upload ke GitHub:
echo.
echo - node_modules/ (terlalu besar)
echo - *.db (database lokal)
echo - *.log (log files)
echo.
echo CATATAN:
echo File-file ini akan di-generate ulang
echo saat npm install dan running aplikasi
echo.
pause

REM Hapus node_modules
if exist "node_modules" (
    echo [INFO] Menghapus node_modules...
    rmdir /s /q node_modules
    echo [OK] node_modules dihapus
) else (
    echo [INFO] node_modules tidak ditemukan
)

REM Hapus database files
echo.
echo [INFO] Menghapus database files...
del /q "server\*.db" 2>nul
del /q "server\*.db-shm" 2>nul
del /q "server\*.db-wal" 2>nul
echo [OK] Database files dihapus

REM Hapus log files
echo.
echo [INFO] Menghapus log files...
del /q "*.log" 2>nul
del /q "server\*.log" 2>nul
echo [OK] Log files dihapus

REM Hapus build files jika ada
if exist "dist" (
    echo.
    echo [INFO] Menghapus dist folder...
    rmdir /s /q dist
    echo [OK] dist folder dihapus
)

echo.
echo ========================================
echo   CLEANUP COMPLETE!
echo ========================================
echo.
echo Folder siap untuk di-upload ke GitHub!
echo.
echo LANGKAH SELANJUTNYA:
echo.
echo OPSI 1 - GitHub Desktop (RECOMMENDED):
echo   1. Download: https://desktop.github.com/
echo   2. Install dan login
echo   3. File -^> Add Local Repository
echo   4. Pilih folder ini
echo   5. Publish repository
echo.
echo OPSI 2 - Manual Upload ZIP:
echo   1. Compress folder ini jadi ZIP
echo   2. Upload via GitHub web interface
echo   3. Buat repository baru
echo   4. Upload files
echo.
echo OPSI 3 - Install Git ^& gunakan git-push.bat:
echo   1. Download Git: https://git-scm.com/download/win
echo   2. Install Git
echo   3. Restart terminal
echo   4. Jalankan: git-push.bat
echo.
echo Detail lengkap ada di file:
echo   CARA_UPLOAD_GITHUB.md
echo.
pause
