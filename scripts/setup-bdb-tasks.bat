@echo off
title BDB - Setup taches planifiees (ADMIN)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Elevation administrateur requise...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-bdb-tasks.ps1"
echo.
pause
