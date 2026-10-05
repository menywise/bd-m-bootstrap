@echo off
title FIX CHEMINS _dev
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-dev-paths.ps1"
echo.
pause
