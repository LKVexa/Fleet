@echo off
setlocal EnableExtensions
pushd "%~dp0bridge-terminal"
where node >nul 2>&1 || ( echo Node.js 20+ is required. & popd & exit /b 2 )
call npm run check || goto :fail
call npm test || goto :fail
call npm run seal || goto :fail
call npm run verify || goto :fail
echo.
echo [Harbor] Release seal PASS
popd
exit /b 0
:fail
set "RC=%ERRORLEVEL%"
echo.
echo [Harbor] Release seal FAILED ^(exit %RC%^)
popd
exit /b %RC%
