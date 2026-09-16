import uvicorn
import os
import sys

# Ensure current folder is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("[INFO] Starting ALORA Smart Campus ML Service on http://127.0.0.1:8001 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=False, log_level="info")
