@echo off
title BDB -- Batch Anatomie Generator v1.0.0
echo.
echo ================================================
echo  BDB -- Batch Anatomie Generator v1.0.0
echo ================================================
echo.
echo  Prerequis :
echo    - .env a la racine avec ANTHROPIC_API_KEY
echo    - batch-anatomie-system-prompt.txt dans scripts/
echo    - Connexion internet active
echo.
echo  Duree estimee : 30-60 minutes
echo  Cout estime   : ~10-12 USD pour 460 protocoles
echo.
pause
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0batch-anatomie-generator.ps1"
echo.
pause
