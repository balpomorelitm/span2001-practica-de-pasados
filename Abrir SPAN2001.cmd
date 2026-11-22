@echo off
title SPAN2001 - revision local
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or later is required.
  pause
  exit /b 1
)
echo Open the Local URL printed below in your browser.
echo Keep this window open while reviewing the site.
echo.
node scripts/serve.mjs
pause
