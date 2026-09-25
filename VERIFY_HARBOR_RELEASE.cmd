@echo off
setlocal EnableExtensions
pushd "%~dp0"
where node >nul 2>&1 || ( echo Node.js 20+ is required. & popd & exit /b 2 )
echo [1/4] External product availability ^(informational unless --strict is used^)
node scripts\check-external-products.js
echo [2/4] Bridge syntax
pushd bridge-terminal
call npm run check || goto :fail_bridge
echo [3/4] Deterministic serial bridge/mobile tests
call npm test || goto :fail_bridge
echo [4/4] Strict sealed-manifest verification
call npm run verify || goto :fail_bridge
popd
echo.
echo [Harbor] VERIFY PASS
popd
exit /b 0
:fail_bridge
set "RC=%ERRORLEVEL%"
popd
echo.
echo [Harbor] VERIFY FAILED ^(exit %RC%^)
popd
exit /b %RC%
