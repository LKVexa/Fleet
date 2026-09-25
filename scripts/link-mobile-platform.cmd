@echo off
setlocal EnableExtensions EnableDelayedExpansion
set HARBOR_ROOT=%~dp0..
if "%HARBOR_ROOT:~-1%"=="\" set HARBOR_ROOT=%HARBOR_ROOT:~0,-1%

set FAIL=0

REM Environment variables are authoritative. PRODUCT_LINK.txt is the portable fallback.
REM No workstation-specific source directory is assumed by this script.
call :link_one "bottle-rocket" "BOTTLE_ROCKET_PRODUCT_ROOT" "BOTTLE_ROCKET_PRODUCT_ROOT" "%HARBOR_ROOT%\mobile-platform\bottle-rocket\PRODUCT_LINK.txt" "%HARBOR_ROOT%\mobile-platform\bottle-rocket\product" "MANIFEST.json"
if errorlevel 1 set /a FAIL+=1

call :link_one "ios-lctl" "IOS735_PRODUCT_ROOT" "PRODUCT_ROOT" "%HARBOR_ROOT%\mobile-platform\nodes\ios-lctl\PRODUCT_LINK.txt" "%HARBOR_ROOT%\mobile-platform\nodes\ios-lctl\product" "README.md"
if errorlevel 1 set /a FAIL+=1

call :link_one "android-lctl" "LINEAR_ANDROID_PRODUCT_ROOT" "PRODUCT_ROOT" "%HARBOR_ROOT%\mobile-platform\nodes\android-lctl\PRODUCT_LINK.txt" "%HARBOR_ROOT%\mobile-platform\nodes\android-lctl\product" "TRANSLATION_REPORT.md"
if errorlevel 1 set /a FAIL+=1

REM RODEO is a sidecar to Linear Android (Gradle substitute), not a peer app node.
call :link_one "rodeo-sidecar" "RODEO_PRODUCT_ROOT" "PRODUCT_ROOT" "%HARBOR_ROOT%\mobile-platform\nodes\android-lctl\sidecar-rodeo\PRODUCT_LINK.txt" "%HARBOR_ROOT%\mobile-platform\nodes\android-lctl\sidecar-rodeo\product" "rodeo.cmd"
if errorlevel 1 set /a FAIL+=1

if %FAIL%==0 (
  echo [link-mobile-platform] OK - VM substrate + iOS/Android app nodes + RODEO sidecar
  exit /b 0
)
echo [link-mobile-platform] completed with %FAIL% missing/failed link^(s^). Harbor can still start.
exit /b 1

:link_one
set "LABEL=%~1"
set "ENV_KEY=%~2"
set "FILE_KEY=%~3"
set "LINK_FILE=%~4"
set "JUNCTION=%~5"
set "MARKER=%~6"
set "SRC="

REM 1. Explicit environment binding.
for /f "tokens=2 delims==" %%V in ('set %ENV_KEY% 2^>nul') do if not defined SRC set "SRC=%%V"

REM 2. Portable per-product link file.
if not defined SRC if exist "%LINK_FILE%" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%LINK_FILE%") do (
    if /I "%%A"=="%FILE_KEY%" if not "%%B"=="" set "SRC=%%B"
  )
)

if not defined SRC (
  echo [link-mobile-platform] %LABEL%: source unset.
  echo   Set %ENV_KEY% or update %LINK_FILE%.
  exit /b 1
)

if not exist "%SRC%\%MARKER%" (
  echo [link-mobile-platform] %LABEL%: source not found or marker missing:
  echo   %SRC%
  echo   expected marker: %MARKER%
  exit /b 1
)

if exist "%JUNCTION%\%MARKER%" (
  echo [link-mobile-platform] %LABEL%: already linked: %JUNCTION%
  exit /b 0
)

if exist "%JUNCTION%" (
  echo [link-mobile-platform] %LABEL%: removing stale junction/folder: %JUNCTION%
  rmdir "%JUNCTION%" 2>nul
)

mklink /J "%JUNCTION%" "%SRC%" >nul 2>&1
if errorlevel 1 (
  echo [link-mobile-platform] %LABEL%: junction failed; trying directory symlink...
  mklink /D "%JUNCTION%" "%SRC%" >nul 2>&1
)

if exist "%JUNCTION%\%MARKER%" (
  echo [link-mobile-platform] %LABEL%: OK -^> %SRC%
  exit /b 0
)
echo [link-mobile-platform] %LABEL%: FAILED to create link.
exit /b 1
