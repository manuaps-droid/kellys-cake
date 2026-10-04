@echo off
title Kellys Cake App
echo ========================================================
echo  Iniciando Kelly's Cake - Aplicacion de Escritorio
echo ========================================================
start msedge --app=http://localhost:3000
if %errorlevel% neq 0 (
  start chrome --app=http://localhost:3000
)
exit
