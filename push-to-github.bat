@echo off
echo Starting GitHub push process...

echo Checking Git status:
git status

echo Adding all changes:
git add .

echo Committing changes:
git commit -m "Update PayEasy application with latest changes"

echo Pushing to GitHub:
git push

echo Process completed!
pause 