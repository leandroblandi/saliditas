@echo off
echo Cleaning up orphaned backend processes...
echo.

echo Stopping all ps-api.exe processes...
taskkill /F /IM ps-api.exe 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Backend processes stopped successfully.
) else (
    echo No backend processes found or already stopped.
)

echo.
echo Checking for remaining processes...
tasklist /FI "IMAGENAME eq ps-api.exe" 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Some backend processes may still be running.
) else (
    echo All backend processes have been cleaned up.
)

echo.
echo Cleanup completed.
pause
