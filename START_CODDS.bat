@echo off
REM Kill any existing processes
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul

timeout /t 2 /nobreak

REM Start Backend
start "CODDS Backend" cmd /k "cd /d C:\Users\admin\Desktop\echo\backend && python run.py"

timeout /t 3 /nobreak

REM Start Frontend
start "CODDS Frontend" cmd /k "cd /d C:\Users\admin\Desktop\echo\frontend && npm start"

echo.
echo.
echo ====================================================
echo   CODDS Application Starting...
echo ====================================================
echo.
echo   Backend:  http://127.0.0.1:5000
echo   Frontend: http://localhost:3000
echo.
echo   Wait 15-20 seconds for both servers to start
echo.
echo ====================================================
echo.

timeout /t 15 /nobreak

start http://localhost:3000

pause
