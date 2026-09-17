from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ComplaintInput(BaseModel):
    title: str = Field(..., example="Water leaking from ceiling pipe")
    description: str = Field(..., example="Ceiling pipe burst in 2nd floor library reading room. Books getting wet.")
    location_building: str = Field(..., example="Central Library")
    location_floor: Optional[str] = Field(None, example="2nd Floor")
    location_room: Optional[str] = Field(None, example="Reading Room 201")
    user_id: Optional[int] = Field(None, example=2)
    photo_base64: Optional[str] = None

class ImageAnomalyInput(BaseModel):
    photo_base64: Optional[str] = None
    image_base64: Optional[str] = None

    def get_base64(self) -> str:
        return self.photo_base64 or self.image_base64 or ""

class ImageAnomalyResult(BaseModel):
    is_authentic: bool
    authenticity_score: float
    status: str
    summary: Optional[str] = None
    detected_anomalies: List[str] = []
    metrics: Dict[str, Any] = {}

class DuplicateCheckInput(BaseModel):
    title: str
    description: str
    location_building: str
    location_floor: Optional[str] = None
    location_room: Optional[str] = None
    threshold: Optional[float] = 0.65

class DuplicateItem(BaseModel):
    complaint_id: Optional[int] = None
    tracking_number: Optional[str] = None
    title: str
    location: str
    similarity_score: float
    status: Optional[str] = "PENDING"

class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    highest_similarity: float
    matched_complaint: Optional[DuplicateItem] = None
    similar_complaints: List[DuplicateItem] = []

class MLRecommendation(BaseModel):
    priority_level: str
    action_checklist: List[str]
    suggested_tools: List[str]
    safety_notes: Optional[str] = None
    suggested_technician_role: str

class MLPredictionResult(BaseModel):
    predicted_category: str
    category_confidence: float
    predicted_department: str
    department_confidence: float
    predicted_severity: str
    severity_confidence: float
    estimated_resolution_hours: float
    duplicate_check: DuplicateCheckResponse
    recommendation: MLRecommendation
    image_anomaly: Optional[ImageAnomalyResult] = None
    model_version: str

class RetrainRequest(BaseModel):
    new_data: Optional[List[Dict[str, Any]]] = None

class RetrainResponse(BaseModel):
    status: str
    message: str
    samples_trained: int
    category_accuracy: float
    department_accuracy: float
    severity_accuracy: float
    trained_at: str

class MetricsResponse(BaseModel):
    model_status: str
    model_version: str
    trained_at: Optional[str] = None
    categories: List[str]
    departments: List[str]
    severities: List[str]
    total_training_samples: int
    accuracy_metrics: Dict[str, float]
