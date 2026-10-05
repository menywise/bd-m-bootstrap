@echo off
title check-before-ftp
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-before-ftp.ps1"
echo.
pause
