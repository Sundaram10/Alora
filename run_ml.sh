#!/bin/bash
echo "[INFO] Starting ALORA ML Service on http://127.0.0.1:8001..."
cd "$(dirname "$0")/alora-ml-service"
/opt/anaconda3/bin/python3 run_ml.py
