import os
import sys
import datetime
import joblib
import numpy as np
import pandas as pd

# Add alora-ml-service root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.calibration import CalibratedClassifierCV
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score

from app.training.dataset import TRAINING_DATA

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "saved_models")
CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "smart_campus_problem_detector_10000.csv"))

def load_10k_data():
    if not os.path.exists(CSV_PATH):
        return list(TRAINING_DATA)
    
    df = pd.read_csv(CSV_PATH)
    records = []
    for _, r in df.iterrows():
        records.append({
            "complaint_id": r.get("complaint_id", ""),
            "title": r.get("complaint_description", "General Complaint"),
            "description": f"{r.get('complaint_description', '')} reported at {r.get('location', '')}",
            "location_building": r.get("location", "Campus Main"),
            "category": r.get("problem_category", "General"),
            "department": r.get("responsible_department", "General Maintenance"),
            "severity": str(r.get("severity", "Medium")).upper(),
            "priority": float(r.get("priority", 3)),
            "affected_people": float(r.get("affected_people", 10)),
            "resolution_hours": float(r.get("actual_resolution_hours") if pd.notna(r.get("actual_resolution_hours")) else r.get("predicted_resolution_hours", 12.0)),
            "status": r.get("status", "Resolved")
        })
    return records

def get_text_feature(row):
    return f"{row['title']} {row['description']} {row.get('location_building', '')}".lower()

def train_and_save_models(extra_data=None):
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    data = load_10k_data()
    if extra_data:
        data.extend(extra_data)
        
    df = pd.DataFrame(data)
    df["full_text"] = df.apply(get_text_feature, axis=1)
    
    X_text = df["full_text"]
    if "priority" not in df.columns:
        df["priority"] = 3.0
    if "affected_people" not in df.columns:
        df["affected_people"] = 10.0
    X_combo = df[["full_text", "priority", "affected_people"]]
    
    y_cat = df["category"]
    y_dept = df["department"]
    y_sev = df["severity"]
    y_hours = df["resolution_hours"]
    
    # 1. Category Classifier (NLP TF-IDF + Calibrated LinearSVC with balanced weights)
    cat_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("clf", CalibratedClassifierCV(LinearSVC(dual=False, random_state=42, class_weight="balanced"), cv=3))
    ])
    cat_pipeline.fit(X_text, y_cat)
    cat_acc = accuracy_score(y_cat, cat_pipeline.predict(X_text))
    
    # 2. Department Classifier
    dept_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"))
    ])
    dept_pipeline.fit(X_text, y_dept)
    dept_acc = accuracy_score(y_dept, dept_pipeline.predict(X_text))
    
    # 3. Severity Classifier (TF-IDF + Numeric)
    preprocessor = ColumnTransformer(transformers=[
        ('text', TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True), 'full_text'),
        ('num', StandardScaler(), ['priority', 'affected_people'])
    ])
    sev_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced"))
    ])
    sev_pipeline.fit(X_combo, y_sev)
    sev_acc = accuracy_score(y_sev, sev_pipeline.predict(X_combo))
    
    # 4. Resolution Time Regressor
    res_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('reg', Ridge(alpha=1.0))
    ])
    res_pipeline.fit(X_combo, y_hours)
    res_preds = res_pipeline.predict(X_combo)
    res_mae = mean_absolute_error(y_hours, res_preds)
    
    # Metadata
    metadata = {
        "model_version": "v2.0.0-10k-dataset",
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_samples": len(df),
        "categories": sorted(list(df["category"].unique())),
        "departments": sorted(list(df["department"].unique())),
        "severities": sorted(list(df["severity"].unique())),
        "accuracies": {
            "category": round(float(cat_acc), 4),
            "department": round(float(dept_acc), 4),
            "severity": round(float(sev_acc), 4),
            "resolution_mae_hours": round(float(res_mae), 2)
        }
    }
    
    # Save artifacts
    joblib.dump(cat_pipeline, os.path.join(MODEL_DIR, "category_model.joblib"))
    joblib.dump(dept_pipeline, os.path.join(MODEL_DIR, "department_model.joblib"))
    joblib.dump(sev_pipeline, os.path.join(MODEL_DIR, "severity_model.joblib"))
    joblib.dump(res_pipeline, os.path.join(MODEL_DIR, "resolution_model.joblib"))
    joblib.dump(metadata, os.path.join(MODEL_DIR, "metadata.joblib"))
    joblib.dump(data, os.path.join(MODEL_DIR, "historical_corpus.joblib"))
    
    print(f"[OK] Models successfully trained on {len(df):,} samples!")
    print(f"Accuracies: Category: {cat_acc:.2%}, Dept: {dept_acc:.2%}, Severity: {sev_acc:.2%}, MAE: {res_mae:.2f}h")
    return metadata

if __name__ == "__main__":
    train_and_save_models()
