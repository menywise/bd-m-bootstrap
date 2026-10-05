@echo off
echo Audit patterns HTML BDB en cours...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0AUDIT_BDB_HTML_PATTERNS.ps1" -RootPath "C:\DEV\BIBLE_DE_BLOC"
echo.
echo Rapport genere : audit-html-patterns.txt
pause
