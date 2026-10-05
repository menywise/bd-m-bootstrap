@echo off
cd /d C:\DEV\BIBLE_DE_BLOC
powershell -ExecutionPolicy Bypass -File scripts\inject-auth-users.ps1
pause
