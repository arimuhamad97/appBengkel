@echo off
REM ============================================
REM   Buka Aplikasi Bengkel dengan Edge
REM ============================================

REM Ganti dengan IP server Anda
set IP_SERVER=192.168.1.100
set PORT=5173
set APP_URL=http://%IP_SERVER%:%PORT%

REM Buka dengan Edge
start msedge "%APP_URL%"
