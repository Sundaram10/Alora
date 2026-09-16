@echo off
title ALORA - Smart Campus Orchestrator
cd /d "%~dp0"
echo =========================================================================
echo               ALORA - SMART CAMPUS COMPLAINT SYSTEM
echo =========================================================================
echo [1/3] Launching Python FastAPI ML Engine (Port 8001)...
start "ALORA ML Service" cmd /k "start_ml_service.bat"

echo [2/3] Launching Java Spring Boot Backend (Port 8080)...
start "ALORA Spring Boot" cmd /k "start_backend.bat"

echo [3/3] Opening ALORA Web Application in browser...
timeout /t 5 /nobreak >nul
start "" "http://localhost:8080/index.html"

echo =========================================================================
echo ALORA Platform is ready!
echo - Web Application: http://localhost:8080/index.html
echo - Spring Boot API: http://localhost:8080/api/complaints
echo - FastAPI ML Docs: http://127.0.0.1:8001/docs
echo =========================================================================
