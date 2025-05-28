@ECHO OFF
SETLOCAL EnableDelayedExpansion

SET "SCRIPT_DIR=%~dp0"

REM Try to find Node.js in standard locations first
if exist "C:\Program Files\nodejs\node.exe" (
    "C:\Program Files\nodejs\node.exe" %*
    exit /b %errorlevel%
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    "C:\Program Files (x86)\nodejs\node.exe" %*
    exit /b %errorlevel%
)

REM If Node.js not found, run installer
call "%SCRIPT_DIR%install-node.cmd" "https://nodejs.org/dist/v23.10.0/node-v23.10.0-x64.msi"
if errorlevel 1 (
    echo Failed to install Node.js
    exit /b 1
)

REM Try using the newly installed Node.js
if exist "C:\Program Files\nodejs\node.exe" (
    "C:\Program Files\nodejs\node.exe" %*
    exit /b %errorlevel%
)

echo Failed to find node after Node.js installation
exit /b 1
