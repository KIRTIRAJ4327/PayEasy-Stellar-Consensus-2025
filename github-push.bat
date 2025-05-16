@echo off
setlocal enabledelayedexpansion

echo ===== PayEasy GitHub Push Utility =====

:: Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Git is not installed or not in the PATH
    goto :error
)

:: Check if we're in a git repository
if not exist .git (
    echo Initializing Git repository...
    git init
    if %ERRORLEVEL% neq 0 goto :error
)

:: Check remote configuration
git remote -v | findstr "origin" >nul
if %ERRORLEVEL% neq 0 (
    echo Setting up remote repository...
    git remote add origin https://github.com/KIRTIRAJ4327/PayEasy-Stellar-Consensus-2025.git
    if %ERRORLEVEL% neq 0 goto :error
)

:: Show status
echo Current Git status:
git status
echo.

:: Ask for commit message
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=Update PayEasy application with latest changes

:: Stage all changes
echo Staging changes...
git add .
if %ERRORLEVEL% neq 0 goto :error

:: Commit changes
echo Committing with message: !COMMIT_MSG!
git commit -m "!COMMIT_MSG!"
if %ERRORLEVEL% neq 0 goto :error

:: Push to GitHub
echo Pushing to GitHub...
git push -u origin master
if %ERRORLEVEL% neq 0 (
    echo Trying alternate branch name 'main'...
    git push -u origin main
    if %ERRORLEVEL% neq 0 goto :error
)

echo.
echo Successfully pushed to GitHub!
goto :end

:error
echo.
echo An error occurred during the GitHub push process.
echo.

:end
echo.
echo Press any key to exit...
pause >nul
endlocal 