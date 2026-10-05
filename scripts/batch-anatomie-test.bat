@echo off
title BDB -- Batch Anatomie TEST v1.0.0
echo.
echo ================================================
echo  BDB -- Batch Anatomie TEST v1.0.0
echo  Mode : 1 protocole a la fois -- resultat immediat
echo ================================================
echo.
echo  Prerequis :
echo    - .env a la racine avec ANTHROPIC_API_KEY
echo    - batch-anatomie-system-prompt.txt dans scripts/
echo    - Connexion internet active
echo.
echo  Output : _batch_anatomie\test\
echo.
pause
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0batch-anatomie-test.ps1"
echo.
pause
