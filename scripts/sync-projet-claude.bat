@echo off
title Sync Projet Claude
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-projet-claude.ps1"
echo.
pause
