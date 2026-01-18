@echo off
REM Deploy CODDS to Railway with one command

echo.
echo ========================================
echo   DEPLOYING CODDS TO RAILWAY
echo ========================================
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js/npm not installed
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git not installed
    pause
    exit /b 1
)

echo [Step 1] Installing Railway CLI...
npm install -g @railway/cli
if errorlevel 1 (
    echo WARNING: Could not install Railway CLI via npm
)

echo.
echo [Step 2] Logging into Railway...
echo Visit: https://railway.app and sign in with GitHub
echo Then run: railway login
railway login

echo.
echo [Step 3] Linking to your project...
railway link

echo.
echo [Step 4] Setting environment variables...
echo Please add these to Railway dashboard:
echo   - MONGODB_URI: (get from MongoDB Atlas)
echo   - JWT_SECRET: your-secret-key
echo   - FLASK_ENV: production

echo.
echo [Step 5] Deploying...
git push

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app is now live on Railway!
echo Check your dashboard at: https://railway.app
echo.
pause
