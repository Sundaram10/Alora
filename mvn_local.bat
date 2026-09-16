@echo off
set "JAVA_HOME=%~dp0tools\jdk-17"
set "PATH=%JAVA_HOME%\bin;%~dp0tools\maven\bin;%PATH%"
"%~dp0tools\maven\bin\mvn.cmd" %*
