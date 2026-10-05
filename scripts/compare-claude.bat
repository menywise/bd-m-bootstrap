@echo off
title Compare Claude - Inventaire Projet
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0compare-claude.ps1"
echo.
pause
