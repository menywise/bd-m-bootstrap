@echo off
title BDB - Migration Site Public
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0migrate-site-public.ps1"
echo.
pause
