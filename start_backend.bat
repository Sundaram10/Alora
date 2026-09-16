@echo off
title ALORA - Spring Boot Backend (Port 8080)
cd /d "%~dp0alora-backend"
set "JAVA_HOME=%~dp0tools\jdk-17"
set "PATH=%JAVA_HOME%\bin;%~dp0tools\maven\bin;%PATH%"
echo ===================================================
echo   ALORA Smart Campus - Spring Boot Java 17 Backend
echo   Port: 8080
echo ===================================================
"%~dp0tools\maven\bin\mvn.cmd" spring-boot:run
pause
