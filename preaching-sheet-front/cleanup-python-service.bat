@echo off
echo Cleaning up Image Generator API service processes...
echo.
echo Stopping all excel-image-generator-api.exe processes...
taskkill /F /IM excel-image-generator-api.exe 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Image Generator API service processes stopped successfully.
) else (
    echo No Image Generator API service processes found or already stopped.
)
echo.
echo Checking for remaining Image Generator API processes...
tasklist /FI "IMAGENAME eq excel-image-generator-api.exe" 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Some Image Generator API processes may still be running.
) else (
    echo All Image Generator API service processes have been cleaned up.
)
echo.
echo Cleanup completed.
pause
