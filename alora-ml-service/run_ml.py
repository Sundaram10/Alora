import uvicorn
import os
import sys

# Ensure current folder is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("[INFO] Starting ALORA Smart Campus ML Service on http://127.0.0.1:8001 ...")
    try:
        from app.models.image_anomaly_engine import get_clip_engine
        print("[INFO] Pre-warming CLIP Vision AI Engine...")
        get_clip_engine()
        print("[OK] CLIP Vision AI Engine ready!")
    except Exception as e:
        print(f"[WARN] CLIP Engine pre-warm notice: {e}")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=False, log_level="info")
