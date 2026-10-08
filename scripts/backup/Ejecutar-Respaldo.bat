@echo off
chcp 65001 > nul
title Respaldo de Seguridad - Kelly's Cake
echo ===================================================
echo     RESPALDO AUTOMATICO LOCAL - KELLY'S CAKE
echo ===================================================
echo.
cd /d "C:\Users\51958\Proyecto\kellys-cake"

echo [*] Extrayendo base de datos completa de Supabase...
call npx tsx scripts/backup/backup-local.ts

echo.
echo [*] Respaldo finalizado.
echo ===================================================
timeout /t 5
