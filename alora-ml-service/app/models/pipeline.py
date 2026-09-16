import os
import re
import joblib
import numpy as np
from typing import Dict, Any

from app.training.trainer import train_and_save_models, MODEL_DIR
from app.models.duplicate_engine import DuplicateDetectionEngine
from app.recommendation.engine import RecommendationEngine

CATEGORY_TO_DEPARTMENT = {
    "Electrical": "Electrical Maintenance",
    "Plumbing": "Plumbing & Water Works",
    "IT & Network": "IT & Network Operations",
    "HVAC": "HVAC & Climate Control",
    "Civil & Carpentry": "Civil Works & Carpentry",
    "Sanitation": "Housekeeping & Sanitation"
}

KEYWORD_RULES = [
    (
        ["dustbin", "trash", "garbage", "rubbish", "litter", "waste", "clean", "cleaning", "sweep", "sweeping",
         "mop", "mopping", "filthy", "dirty", "washroom dirty", "toilet cleaning", "stench", "odor", "foul smell",
         "stain", "cockroach", "pest control", "hygiene", "sanitary", "napkin", "overflow", "broom", "disinfection"],
        "Sanitation",
        "Housekeeping & Sanitation"
    ),
    (
        ["ac", "air conditioner", "air conditioning", "cooling", "not cooling", "warm air", "chiller",
         "thermostat", "duct", "condenser", "compressor", "ahu", "refrigerant", "fan coil", "airflow"],
        "HVAC",
        "HVAC & Climate Control"
    ),
    (
        ["water leak", "leaking tap", "tap leak", "pipe burst", "faucet", "washbasin", "sink", "flush valve",
         "flush tank", "toilet flush", "drain", "drainage", "clogged drain", "sewer", "water tank", "motor pump",
         "shower head", "no running water", "geyser", "water cooler"],
        "Plumbing",
        "Plumbing & Water Works"
    ),
    (
        ["spark", "sparking", "flicker", "flickering", "tube light", "bulb", "mcb", "circuit breaker",
         "tripped", "switchboard", "socket", "power outlet", "live wire", "exposed wire", "electric shock",
         "earthing", "power outage", "ceiling fan", "fan regulator", "ups", "blackout", "phase failure"],
        "Electrical",
        "Electrical Maintenance"
    ),
    (
        ["wifi", "wi-fi", "internet", "router", "access point", "ethernet", "lan port", "lan cable",
         "switch port", "dns", "portal", "biometric", "projector", "hdmi", "smart board", "slow internet",
         "packet loss", "operating system boot", "network down"],
        "IT & Network",
        "IT & Network Operations"
    ),
    (
        ["door lock", "lock cylinder", "latch", "hinge", "window glass", "glass pane", "desk", "bench",
         "chair", "wobbling table", "cupboard", "wardrobe", "furniture", "whiteboard", "blackboard",
         "ceiling tile", "cracked tile", "wall plaster", "broken leg", "door won't", "door jammed"],
        "Civil & Carpentry",
        "Civil Works & Carpentry"
    )
]

class UnifiedMLPipeline:
    def __init__(self):
        self.cat_model = None
        self.dept_model = None
        self.sev_model = None
        self.res_model = None
        self.metadata = None
        self.duplicate_engine = None
        self.load_or_train_models()

    def load_or_train_models(self):
        cat_file = os.path.join(MODEL_DIR, "category_model.joblib")
        if not os.path.exists(cat_file):
            print("[INFO] Trained models not found. Running initial training pipeline...")
            train_and_save_models()

        self.cat_model = joblib.load(os.path.join(MODEL_DIR, "category_model.joblib"))
        self.dept_model = joblib.load(os.path.join(MODEL_DIR, "department_model.joblib"))
        self.sev_model = joblib.load(os.path.join(MODEL_DIR, "severity_model.joblib"))
        self.res_model = joblib.load(os.path.join(MODEL_DIR, "resolution_model.joblib"))
        self.metadata = joblib.load(os.path.join(MODEL_DIR, "metadata.joblib"))
        
        self.duplicate_engine = DuplicateDetectionEngine()
        print("[OK] ALORA ML Pipeline loaded successfully!")

    def predict(self, title: str, description: str, building: str, floor: str = "", room: str = "", user_id: int = None) -> Dict[str, Any]:
        raw_text = f"{title} {description}".lower()
        full_text = f"{title} {description} {building}".lower()

        # Check domain keyword rules first for unambiguous match
        matched_cat = None
        matched_dept = None
        for keywords, cat, dept in KEYWORD_RULES:
            for kw in keywords:
                if re.search(r"\b" + re.escape(kw) + r"\b", raw_text):
                    matched_cat = cat
                    matched_dept = dept
                    break
            if matched_cat:
                break

        # 1. Category Prediction + Confidence
        if matched_cat:
            cat_pred = matched_cat
            cat_conf = 0.94
        else:
            cat_pred = self.cat_model.predict([full_text])[0]
            cat_probs = self.cat_model.predict_proba([full_text])[0]
            cat_conf = float(np.max(cat_probs))

        # 2. Department Prediction: strictly synchronized with Category
        dept_pred = matched_dept or CATEGORY_TO_DEPARTMENT.get(cat_pred, self.dept_model.predict([full_text])[0])
        dept_conf = cat_conf

        # 3. Severity Prediction + Confidence
        # Urgent keywords check
        if any(w in raw_text for w in ["spark", "fire", "shock", "burst", "ruptured", "burning", "smoke"]):
            sev_pred = "CRITICAL"
            sev_conf = 0.95
        elif any(w in raw_text for w in ["leak", "slippery", "hazard", "down", "outage", "broken glass", "stench"]):
            sev_pred = "HIGH"
            sev_conf = 0.88
        else:
            sev_pred = self.sev_model.predict([full_text])[0]
            sev_probs = self.sev_model.predict_proba([full_text])[0]
            sev_conf = float(np.max(sev_probs))

        # 4. Estimated Resolution Hours
        hours_pred = float(self.res_model.predict([full_text])[0])
        # Bound between 1.0 hour and 48.0 hours
        hours_pred = max(1.0, min(48.0, round(hours_pred, 1)))

        # 5. Duplicate Check
        dup_result = self.duplicate_engine.check_duplicate(
            title=title,
            description=description,
            building=building,
            floor=floor,
            room=room
        )

        # 6. Action Recommendations
        recs = RecommendationEngine.generate_recommendations(
            category=cat_pred,
            department=dept_pred,
            severity=sev_pred,
            location=building
        )

        return {
            "predicted_category": cat_pred,
            "category_confidence": round(cat_conf, 3),
            "predicted_department": dept_pred,
            "department_confidence": round(dept_conf, 3),
            "predicted_severity": sev_pred,
            "severity_confidence": round(sev_conf, 3),
            "estimated_resolution_hours": hours_pred,
            "duplicate_check": dup_result,
            "recommendation": recs,
            "model_version": self.metadata.get("model_version", "v1.3.0")
        }

    def check_duplicate_only(self, title: str, description: str, building: str, floor: str = "", room: str = "", threshold: float = 0.60) -> Dict[str, Any]:
        return self.duplicate_engine.check_duplicate(
            title=title,
            description=description,
            building=building,
            floor=floor,
            room=room,
            threshold=threshold
        )

    def retrain(self, new_data=None):
        meta = train_and_save_models(extra_data=new_data)
        self.load_or_train_models()
        return meta

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "model_status": "READY",
            "model_version": self.metadata.get("model_version", "v1.3.0"),
            "trained_at": self.metadata.get("trained_at"),
            "categories": self.metadata.get("categories", []),
            "departments": self.metadata.get("departments", []),
            "severities": self.metadata.get("severities", []),
            "total_training_samples": self.metadata.get("total_samples", 0),
            "accuracy_metrics": self.metadata.get("accuracies", {})
        }

# Global singleton
pipeline_instance = UnifiedMLPipeline()
