@echo off
setlocal EnableExtensions EnableDelayedExpansion
pushd "%~dp0"
set "MAXLEN=0"
set "MAXPATH="
for /r %%F in (*) do (
  set "P=%%~fF"
  call :strlen "%%~fF" LEN
  if !LEN! GTR !MAXLEN! (set "MAXLEN=!LEN!" & set "MAXPATH=%%~fF")
)
echo Harbor Windows Path Preflight
echo Root: %CD%
echo Longest absolute path: !MAXLEN! characters
echo !MAXPATH!
if !MAXLEN! GTR 240 (
  echo [FAIL] Move HBT closer to the drive root, for example D:\HBT or C:\HBT.
  popd & exit /b 64
)
if !MAXLEN! GTR 220 (echo [WARN] Close to the conservative limit.) else (echo [PASS] Windows path budget is safe.)
popd & exit /b 0
:strlen
setlocal EnableDelayedExpansion
set "s=%~1"
set /a n=0
:strlen_loop
if defined s (set "s=!s:~1!" & set /a n+=1 & goto strlen_loop)
endlocal & set "%~2=%n%"
exit /b 0
