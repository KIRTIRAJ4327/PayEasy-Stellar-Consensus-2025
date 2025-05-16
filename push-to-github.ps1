# PayEasy GitHub Push Utility

Write-Host "===== PayEasy GitHub Push Utility =====" -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Git detected: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in the PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to initialize Git repository" -ForegroundColor Red
        exit 1
    }
}

# Check remote configuration
$hasOrigin = git remote -v | Select-String "origin"
if (-not $hasOrigin) {
    Write-Host "Setting up remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/KIRTIRAJ4327/PayEasy-Stellar-Consensus-2025.git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to add remote repository" -ForegroundColor Red
        exit 1
    }
}

# Show status
Write-Host "Current Git status:" -ForegroundColor Cyan
git status

# Ask for commit message
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update PayEasy application with latest changes"
}

# Stage all changes
Write-Host "Staging changes..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to stage changes" -ForegroundColor Red
    exit 1
}

# Commit changes
Write-Host "Committing with message: $commitMsg" -ForegroundColor Yellow
git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to commit changes" -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
$pushResult = git push -u origin master 2>&1
if ($LASTEXITCODE -ne 0) {
    # Try main branch if master fails
    Write-Host "Trying alternate branch name 'main'..." -ForegroundColor Yellow
    $pushResult = git push -u origin main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to push to GitHub: $pushResult" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nSuccessfully pushed to GitHub!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 