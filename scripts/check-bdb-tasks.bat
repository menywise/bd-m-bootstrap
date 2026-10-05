@echo off
title BDB - Verification taches planifiees
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-bdb-tasks.ps1"
echo.
pause
