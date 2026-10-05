@echo off
chcp 65001 > nul
if not exist "C:\DEV\BIBLE_DE_BLOC\gouvernance" mkdir "C:\DEV\BIBLE_DE_BLOC\gouvernance"
powershell -ExecutionPolicy Bypass -File "%~dp0audit-hardcoded-racine.ps1"
pause
