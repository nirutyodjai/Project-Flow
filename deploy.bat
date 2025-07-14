@echo off
echo Building Next.js application...
npx next build
if %errorlevel% neq 0 (
    echo Build failed with error code %errorlevel%
    pause
    exit /b %errorlevel%
)
echo Build completed successfully!
echo Deploying to Firebase...
firebase deploy
if %errorlevel% neq 0 (
    echo Deploy failed with error code %errorlevel%
    pause
    exit /b %errorlevel%
)
echo Deploy completed successfully!
pause
