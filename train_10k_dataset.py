import os
import sys
import time
import datetime
import joblib
import pandas as pd
import numpy as np
import urllib.request
import json

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_SERVICE_DIR = os.path.join(BASE_DIR, "alora-ml-service")
sys.path.insert(0, ML_SERVICE_DIR)

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.calibration import CalibratedClassifierCV
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

MODEL_DIR = os.path.join(ML_SERVICE_DIR, "app", "saved_models")
CSV_PATH = os.path.join(BASE_DIR, "smart_campus_problem_detector_10000.csv")

def load_and_preprocess_dataset(csv_path):
    print(f"[INFO] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[INFO] Total rows loaded: {len(df)}")
    
    # Map fields
    df["title"] = df["complaint_description"].fillna("General Complaint")
    df["description"] = df.apply(lambda r: f"{r['complaint_description']} reported at {r['location']}", axis=1)
    df["location_building"] = df["location"].fillna("Campus Main")
    df["category"] = df["problem_category"].fillna("General")
    df["department"] = df["responsible_department"].fillna("General Maintenance")
    df["severity"] = df["severity"].fillna("Medium").astype(str).str.upper()
    df["priority"] = df["priority"].fillna(3).astype(float)
    df["affected_people"] = df["affected_people"].fillna(10).astype(float)
    
    # Resolution hours fallback
    df["resolution_hours"] = df["actual_resolution_hours"].fillna(df["predicted_resolution_hours"]).fillna(12.0)
    df["resolution_hours"] = df["resolution_hours"].apply(lambda h: max(0.5, float(h)))
    
    # Full text feature
    df["full_text"] = df.apply(lambda r: f"{r['title']} {r['description']} {r['location_building']}".lower(), axis=1)
    
    # Format list of records for corpus / retrain payload
    records = []
    for idx, r in df.iterrows():
        records.append({
            "complaint_id": r["complaint_id"],
            "title": r["title"],
            "description": r["description"],
            "location_building": r["location_building"],
            "category": r["category"],
            "department": r["department"],
            "severity": r["severity"],
            "resolution_hours": r["resolution_hours"],
            "status": r["status"]
        })
        
    return df, records

def train_and_evaluate():
    start_time = time.time()
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    df, records = load_and_preprocess_dataset(CSV_PATH)
    
    X_text = df["full_text"]
    X_combo = df[["full_text", "priority", "affected_people"]]
    y_cat = df["category"]
    y_dept = df["department"]
    y_sev = df["severity"]
    y_hours = df["resolution_hours"]
    
    # Train-test split (80/20) for realistic evaluation
    X_text_tr, X_text_te, X_comb_tr, X_comb_te, cat_tr, cat_te, dept_tr, dept_te, sev_tr, sev_te, hours_tr, hours_te = train_test_split(
        X_text, X_combo, y_cat, y_dept, y_sev, y_hours, test_size=0.2, random_state=42
    )
    
    print("\n[TRAINING] 1. Category Classifier (LinearSVC + Calibrated)...")
    cat_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("clf", CalibratedClassifierCV(LinearSVC(dual=False, random_state=42, class_weight="balanced"), cv=3))
    ])
    cat_pipeline.fit(X_text_tr, cat_tr)
    cat_test_acc = accuracy_score(cat_te, cat_pipeline.predict(X_text_te))
    
    print("[TRAINING] 2. Department Classifier (Logistic Regression)...")
    dept_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"))
    ])
    dept_pipeline.fit(X_text_tr, dept_tr)
    dept_test_acc = accuracy_score(dept_te, dept_pipeline.predict(X_text_te))
    
    print("[TRAINING] 3. Enhanced Severity Classifier (TF-IDF + Tabular features)...")
    preprocessor = ColumnTransformer(transformers=[
        ('text', TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True), 'full_text'),
        ('num', StandardScaler(), ['priority', 'affected_people'])
    ])
    
    sev_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced"))
    ])
    sev_pipeline.fit(X_comb_tr, sev_tr)
    sev_test_acc = accuracy_score(sev_te, sev_pipeline.predict(X_comb_te))
    
    print("[TRAINING] 4. Enhanced Resolution Time Regressor (Ridge)...")
    res_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('reg', Ridge(alpha=1.0))
    ])
    res_pipeline.fit(X_comb_tr, hours_tr)
    hours_pred = res_pipeline.predict(X_comb_te)
    hours_mae = mean_absolute_error(hours_te, hours_pred)
    hours_r2 = r2_score(hours_te, hours_pred)
    
    # Re-fit pipelines on full 10,000 dataset for production deployment
    print("\n[DEPLOY] Fitting models on full 10,000 dataset for production release...")
    cat_pipeline.fit(X_text, y_cat)
    dept_pipeline.fit(X_text, y_dept)
    sev_pipeline.fit(X_combo, y_sev)
    res_pipeline.fit(X_combo, y_hours)
    
    cat_full_acc = accuracy_score(y_cat, cat_pipeline.predict(X_text))
    dept_full_acc = accuracy_score(y_dept, dept_pipeline.predict(X_text))
    sev_full_acc = accuracy_score(y_sev, sev_pipeline.predict(X_combo))
    
    elapsed = time.time() - start_time
    
    metadata = {
        "model_version": "v2.0.0-10k-dataset",
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "dataset_source": "smart_campus_problem_detector_10000.csv",
        "total_samples": len(df),
        "training_time_seconds": round(elapsed, 2),
        "categories": sorted(list(df["category"].unique())),
        "departments": sorted(list(df["department"].unique())),
        "severities": sorted(list(df["severity"].unique())),
        "accuracies": {
            "category_test": round(float(cat_test_acc), 4),
            "department_test": round(float(dept_test_acc), 4),
            "severity_test": round(float(sev_test_acc), 4),
            "category": round(float(cat_full_acc), 4),
            "department": round(float(dept_full_acc), 4),
            "severity": round(float(sev_full_acc), 4),
            "resolution_mae_hours": round(float(hours_mae), 2),
            "resolution_r2": round(float(hours_r2), 4)
        }
    }
    
    # Save model artifacts
    joblib.dump(cat_pipeline, os.path.join(MODEL_DIR, "category_model.joblib"))
    joblib.dump(dept_pipeline, os.path.join(MODEL_DIR, "department_model.joblib"))
    joblib.dump(sev_pipeline, os.path.join(MODEL_DIR, "severity_model.joblib"))
    joblib.dump(res_pipeline, os.path.join(MODEL_DIR, "resolution_model.joblib"))
    joblib.dump(metadata, os.path.join(MODEL_DIR, "metadata.joblib"))
    joblib.dump(records, os.path.join(MODEL_DIR, "historical_corpus.joblib"))
    
    print("\n========================================================")
    print("      🎉 ALORA 10K MODEL TRAINING COMPLETED SUCCESS!")
    print("========================================================")
    print(f"Dataset Size       : {len(df):,} complaints")
    print(f"Training Time      : {elapsed:.2f} seconds")
    print(f"Category Accuracy  : Test={cat_test_acc:.2%}, Full={cat_full_acc:.2%}")
    print(f"Dept Accuracy      : Test={dept_test_acc:.2%}, Full={dept_full_acc:.2%}")
    print(f"Severity Accuracy  : Test={sev_test_acc:.2%}, Full={sev_full_acc:.2%}")
    print(f"Resolution Est MAE : {hours_mae:.2f} hours (R2 = {hours_r2:.4f})")
    print("========================================================\n")
    
    # Notify running FastAPI service to hot-reload
    try:
        url = "http://127.0.0.1:8001/api/ml/retrain"
        req = urllib.request.Request(
            url,
            data=json.dumps({"new_data": []}).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            print("[HOT-RELOAD] Triggered ML service hot-reload endpoint successfully!")
    except Exception as e:
        print(f"[NOTE] ML Service hot-reload notification: {e}")

if __name__ == "__main__":
    train_and_evaluate()
