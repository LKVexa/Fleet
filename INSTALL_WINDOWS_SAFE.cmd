@echo off
setlocal EnableExtensions
set "SRC=%~dp0"
set "DEST=%~1"
if not defined DEST (if exist D:\ (set "DEST=D:\HBT") else (set "DEST=C:\HBT"))
for %%I in ("%DEST%") do set "DEST=%%~fI"
echo Copying Harbor to "%DEST%" ...
if not exist "%DEST%" mkdir "%DEST%" || exit /b 5
robocopy "%SRC%" "%DEST%" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1 /NFL /NDL /NJH /NJS /NP
set "RC=%ERRORLEVEL%"
if %RC% GEQ 8 (echo [FAIL] robocopy exit %RC%. & exit /b %RC%)
call "%DEST%\WINDOWS_PATH_PREFLIGHT.cmd"
if errorlevel 1 exit /b %ERRORLEVEL%
echo [PASS] Windows-safe Harbor copy is ready at "%DEST%".
exit /b 0
