@echo off
title ALORA - Python FastAPI ML Service (Port 8001)
cd /d "%~dp0alora-ml-service"
echo ===================================================
echo   ALORA Smart Campus - Python FastAPI ML Engine
echo   Port: 8001
echo ===================================================
python run_ml.py
pause
