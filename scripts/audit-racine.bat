@echo off
title AUDIT RACINE BDB
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0audit-racine.ps1"
echo.
pause
