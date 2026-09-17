from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.payload import (
    ComplaintInput,
    MLPredictionResult,
    DuplicateCheckInput,
    DuplicateCheckResponse,
    RetrainRequest,
    RetrainResponse,
    MetricsResponse,
    ImageAnomalyInput,
    ImageAnomalyResult
)
from app.models.pipeline import pipeline_instance
from app.models.image_anomaly_engine import ImageAnomalyEngine

app = FastAPI(
    title="ALORA - Smart Campus ML Service",
    description="Multi-model AI service for complaint categorization, department routing, severity classification, resolution estimation, and duplicate detection.",
    version="1.2.0"
)

# Enable CORS for Spring Boot & Web Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "ALORA Smart Campus ML Engine",
        "status": "ONLINE",
        "endpoints": [
            "/api/ml/predict",
            "/api/ml/check-duplicate",
            "/api/ml/retrain",
            "/api/ml/metrics",
            "/health"
        ]
    }

@app.get("/health")
@app.get("/api/ml/health")
def health_check():
    return {
        "status": "HEALTHY",
        "model_status": "READY" if pipeline_instance.cat_model else "UNINITIALIZED",
        "version": "1.2.0"
    }

@app.post("/api/ml/predict", response_model=MLPredictionResult)
def predict_complaint(complaint: ComplaintInput):
    try:
        res = pipeline_instance.predict(
            title=complaint.title,
            description=complaint.description,
            building=complaint.location_building,
            floor=complaint.location_floor or "",
            room=complaint.location_room or "",
            user_id=complaint.user_id,
            photo_base64=complaint.photo_base64
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/ml/analyze-image-anomaly", response_model=ImageAnomalyResult)
def analyze_image_anomaly(payload: ImageAnomalyInput):
    try:
        return ImageAnomalyEngine.analyze_image(payload.get_base64())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image anomaly analysis error: {str(e)}")

@app.post("/api/ml/check-duplicate", response_model=DuplicateCheckResponse)
def check_duplicate(payload: DuplicateCheckInput):
    try:
        res = pipeline_instance.check_duplicate_only(
            title=payload.title,
            description=payload.description,
            building=payload.location_building,
            floor=payload.location_floor or "",
            room=payload.location_room or "",
            threshold=payload.threshold or 0.60
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate check error: {str(e)}")

@app.post("/api/ml/retrain", response_model=RetrainResponse)
def retrain_models(request: RetrainRequest):
    try:
        metadata = pipeline_instance.retrain(new_data=request.new_data)
        return {
            "status": "SUCCESS",
            "message": "ALORA ML models retrained and hot-reloaded successfully.",
            "samples_trained": metadata.get("total_samples", 0),
            "category_accuracy": metadata.get("accuracies", {}).get("category", 0.0),
            "department_accuracy": metadata.get("accuracies", {}).get("department", 0.0),
            "severity_accuracy": metadata.get("accuracies", {}).get("severity", 0.0),
            "trained_at": metadata.get("trained_at", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")

@app.get("/api/ml/metrics", response_model=MetricsResponse)
def get_metrics():
    try:
        return pipeline_instance.get_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics error: {str(e)}")
