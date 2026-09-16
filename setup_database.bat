@echo off
title ALORA - MySQL Database Setup
cd /d "%~dp0"
echo ===================================================
echo   ALORA Smart Campus - MySQL Database Setup
echo ===================================================

set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist "%MYSQL_PATH%" (
    echo [!] Could not locate mysql.exe at default path: %MYSQL_PATH%
    echo Please import database\schema.sql and database\seed_data.sql manually.
    pause
    exit /b 1
)

echo Importing schema.sql ...
"%MYSQL_PATH%" -u root -p < "%~dp0database\schema.sql"
if %ERRORLEVEL% equ 0 (
    echo [OK] schema.sql imported successfully!
    echo Importing seed_data.sql ...
    "%MYSQL_PATH%" -u root -p < "%~dp0database\seed_data.sql"
    if %ERRORLEVEL% equ 0 (
        echo [OK] seed_data.sql imported successfully!
    )
)

echo Database initialization complete.
pause
