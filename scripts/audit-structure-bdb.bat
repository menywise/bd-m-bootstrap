@echo off
title BDB - Audit Structure
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0audit-structure-bdb.ps1"
echo.
pause
