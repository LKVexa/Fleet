@echo off
setlocal EnableExtensions
set "HARBOR_ROOT=%~dp0.."
for %%I in ("%HARBOR_ROOT%") do set "HARBOR_ROOT=%%~fI"
set "LINK_FILE=%HARBOR_ROOT%\optical-desktop\PRODUCT_LINK.txt"
set "JUNCTION=%HARBOR_ROOT%\optical-desktop\portable"

set "JA21_SRC=%JA21_PORTABLE_ROOT%"
if not defined JA21_SRC if exist "%LINK_FILE%" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%LINK_FILE%") do if /I "%%A"=="JA21_PORTABLE_ROOT" set "JA21_SRC=%%B"
)
if not defined JA21_SRC (
  echo [link-optical-desktop] JA21 source is not configured.
  echo Set JA21_PORTABLE_ROOT or edit optical-desktop\PRODUCT_LINK.txt.
  exit /b 2
)
if not exist "%JA21_SRC%\Start JA21 Portable Desktop.cmd" (
  echo [link-optical-desktop] JA21 sentinel not found: "%JA21_SRC%\Start JA21 Portable Desktop.cmd"
  exit /b 1
)
if exist "%JUNCTION%\Start JA21 Portable Desktop.cmd" ( echo [link-optical-desktop] already linked: "%JUNCTION%" & exit /b 0 )
if exist "%JUNCTION%" rmdir "%JUNCTION%" 2>nul
mklink /J "%JUNCTION%" "%JA21_SRC%" >nul 2>&1
if errorlevel 1 mklink /D "%JUNCTION%" "%JA21_SRC%" >nul 2>&1
if exist "%JUNCTION%\Start JA21 Portable Desktop.cmd" ( echo [link-optical-desktop] OK -^> "%JA21_SRC%" & exit /b 0 )
echo [link-optical-desktop] FAILED to create link.
exit /b 1
