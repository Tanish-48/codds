@echo off
REM CODDS Setup Script for Windows

echo =========================================
echo CODDS - Setup Script
echo =========================================

REM Check Python
echo.
echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found! Please install Python 3.8+
    pause
    exit /b 1
)
echo OK - Python found

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found! Please install Node.js 14+
    pause
    exit /b 1
)
echo OK - Node.js found

REM Backend Setup
echo.
echo =========================================
echo Setting up Backend...
echo =========================================

cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if not exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit .env with your MongoDB URI and secrets
)

REM Download NLTK data
echo Downloading NLTK data...
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

cd ..

REM Frontend Setup
echo.
echo =========================================
echo Setting up Frontend...
echo =========================================

cd frontend

if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
) else (
    echo Node modules already installed
)

cd ..

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   python run.py
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm start
echo.
echo Frontend will open at: http://localhost:3000
echo Backend API at: http://localhost:5000
echo.
pause
