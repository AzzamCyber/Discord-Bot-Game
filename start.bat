@echo off
title Discord Economy Bot - Slash Commands
echo ========================================
echo    DISCORD ECONOMY BOT v2.0
echo    Slash Commands Edition
echo    Made By Natakenshi Dev
echo ========================================
echo.
echo Installing dependencies...
npm install

echo.
echo Deploying slash commands...
node deploy-commands.js

echo.
echo Starting bot...
node index.js

pause