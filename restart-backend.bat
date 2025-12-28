@echo off
REM CricketAI Backend Restart Script for Windows
REM Kills any process on port 8000 and restarts the backend server

echo.
echo Restarting CricketAI Backend Server...
echo.

REM Find and kill process on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| find "8000" ^| find "LISTENING"') do taskkill /F /PID %%a

timeout /t 1 /nobreak

echo.
echo Starting backend server...
echo Server will run on http://localhost:8000
echo.

npm run dev
