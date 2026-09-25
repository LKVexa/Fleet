@echo off
setlocal EnableExtensions
set "HARBOR_ROOT=%~dp0.."
for %%I in ("%HARBOR_ROOT%") do set "HARBOR_ROOT=%%~fI"
set "LINK_FILE=%HARBOR_ROOT%\qvm\PRODUCT_LINK.txt"
set "JUNCTION=%HARBOR_ROOT%\qvm\product"

set "QVM_SRC=%QVM_PRODUCT_ROOT%"
if not defined QVM_SRC if exist "%LINK_FILE%" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%LINK_FILE%") do if /I "%%A"=="QVM_PRODUCT_ROOT" set "QVM_SRC=%%B"
)
if not defined QVM_SRC (
  echo [link-qvm] QVM source is not configured.
  echo Set QVM_PRODUCT_ROOT or edit qvm\PRODUCT_LINK.txt.
  exit /b 2
)
if not exist "%QVM_SRC%\qvm\cli.py" (
  echo [link-qvm] QVM sentinel not found: "%QVM_SRC%\qvm\cli.py"
  exit /b 1
)
if exist "%JUNCTION%\qvm\cli.py" ( echo [link-qvm] already linked: "%JUNCTION%" & exit /b 0 )
if exist "%JUNCTION%" rmdir "%JUNCTION%" 2>nul
mklink /J "%JUNCTION%" "%QVM_SRC%" >nul 2>&1
if errorlevel 1 mklink /D "%JUNCTION%" "%QVM_SRC%" >nul 2>&1
if exist "%JUNCTION%\qvm\cli.py" ( echo [link-qvm] OK -^> "%QVM_SRC%" & exit /b 0 )
echo [link-qvm] FAILED to create link.
exit /b 1
