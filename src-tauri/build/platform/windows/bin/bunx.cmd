@ECHO OFF
SETLOCAL EnableDelayedExpansion

SET "SCRIPT_DIR=%~dp0"

:: Check if we already have bun installed
if exist "C:\Users\me\AppData\Roaming\npm\bunx.cmd" (
    goto :bun_found
)

:: Check if Node.js is installed in Program Files
if exist "C:\Program Files\nodejs\node.exe" (
    echo Node.js found in Program Files
    set "NPM_EXE=C:\Program Files\nodejs\npm.cmd"
    goto :node_found
)

:: Check if Node.js is installed in Program Files (x86)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo Node.js found in Program Files (x86)
    set "NPM_EXE=C:\Program Files (x86)\nodejs\npm.cmd"
    goto :node_found
)

REM If Node.js not found, run installer
call "%SCRIPT_DIR%install-node.cmd" "https://nodejs.org/dist/v23.10.0/node-v23.10.0-x64.msi"
set "NPM_EXE=C:\Program Files\nodejs\npm.cmd"
if errorlevel 1 (
    echo Failed to install Node.js
    exit /b 1
)

:node_found

:: Install "bunx
cmd.exe /c "%NPM_EXE%" install -g bun@1.2

:bun_found

:: Use bunx
"C:\Users\me\AppData\Roaming\npm\bun.cmd" x %*
exit /b %errorlevel%
