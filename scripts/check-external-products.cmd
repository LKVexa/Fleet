@echo off
setlocal EnableExtensions
pushd "%~dp0.."
where node >nul 2>&1 || ( echo Node.js 20+ is required. & popd & exit /b 2 )
node "%~dp0check-external-products.js" %*
set "RC=%ERRORLEVEL%"
popd
exit /b %RC%
