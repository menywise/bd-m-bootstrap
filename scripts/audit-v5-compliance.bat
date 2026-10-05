@echo off
REM ============================================================
REM AUDIT-V5-COMPLIANCE.BAT
REM Usage : audit-v5-compliance.bat [dossier]
REM   Ex: audit-v5-compliance.bat atelier
REM   Ex: audit-v5-compliance.bat modules\admin
REM   Ex: audit-v5-compliance.bat .
REM ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0audit-v5-compliance.ps1" %*
