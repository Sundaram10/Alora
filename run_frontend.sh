#!/bin/bash
echo "[INFO] Serving ALORA Frontend on http://127.0.0.1:3000..."
cd "$(dirname "$0")/alora-frontend"
/opt/anaconda3/bin/python3 -m http.server 3000
