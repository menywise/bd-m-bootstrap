@echo off
title Clean Gouvernance BDB
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0clean-gouvernance.ps1"
echo.
pause
