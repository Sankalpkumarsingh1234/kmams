@echo off
echo Adding files to git...
git add .
echo Committing changes...
git commit -m "fix: switch to llama-3.1-8b-instant, patch active triggers file, and fix twilio parameters"
echo Pushing to GitHub...
git push
echo.
echo Deployment triggered! Vercel will now update.
pause
