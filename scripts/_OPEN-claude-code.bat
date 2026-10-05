@echo off
title Claude Code - BDB
cd /d C:\DEV\BIBLE_DE_BLOC

:: Chargement des variables Supabase depuis .env
for /f "usebackq tokens=1,* delims==" %%A in (".env") do set %%A=%%B

claude --dangerously-skip-permissions
