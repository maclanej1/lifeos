@echo off
title LifeOS Web Server
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting LifeOS...
echo.
npx expo start --web --port 5000
echo.
echo Server closed. Press any key to exit...
pause >nul
