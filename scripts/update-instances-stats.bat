@echo off
rem update-instances-stats.bat
rem Lance update-instances-stats.ps1 (stats Supabase -> instances-stats.js)
rem Placer dans scripts/ au meme niveau que le .ps1

powershell.exe -ExecutionPolicy Bypass -File "%~dp0update-instances-stats.ps1"
pause
