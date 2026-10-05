@echo off
title FIX CDN @latest -> @v2.0.0
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-cdn-latest.ps1"
echo.
pause
