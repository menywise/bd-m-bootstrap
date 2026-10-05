@echo off
title Build Cockpit BDB
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-cockpit.ps1"
echo.
pause
