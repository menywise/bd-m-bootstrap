@echo off
title audit-gouvernance
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0audit-gouvernance.ps1"
echo.
pause
