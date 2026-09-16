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
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

from app.training.dataset import TRAINING_DATA

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "saved_models")

def get_text_feature(row):
    return f"{row['title']} {row['description']} {row.get('location_building', '')}".lower()

def train_and_save_models(extra_data=None):
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    data = list(TRAINING_DATA)
    if extra_data:
        data.extend(extra_data)
        
    df = pd.DataFrame(data)
    df["full_text"] = df.apply(get_text_feature, axis=1)
    
    X = df["full_text"]
    y_cat = df["category"]
    y_dept = df["department"]
    y_sev = df["severity"]
    y_hours = df["resolution_hours"]
    
    # 1. Category Classifier (NLP TF-IDF + Calibrated LinearSVC with balanced weights)
    cat_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
        ("clf", CalibratedClassifierCV(LinearSVC(dual=False, random_state=42, class_weight="balanced"), cv=2))
    ])
    cat_pipeline.fit(X, y_cat)
    cat_preds = cat_pipeline.predict(X)
    cat_acc = accuracy_score(y_cat, cat_preds)
    
    # 2. Department Classifier
    dept_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"))
    ])
    dept_pipeline.fit(X, y_dept)
    dept_preds = dept_pipeline.predict(X)
    dept_acc = accuracy_score(y_dept, dept_preds)
    
    # 3. Severity Classifier
    sev_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"))
    ])
    sev_pipeline.fit(X, y_sev)
    sev_preds = sev_pipeline.predict(X)
    sev_acc = accuracy_score(y_sev, sev_preds)
    
    # 4. Resolution Time Regressor
    res_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
        ("reg", Ridge(alpha=1.0))
    ])
    res_pipeline.fit(X, y_hours)
    
    # Metadata
    metadata = {
        "model_version": "v1.3.0",
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_samples": len(df),
        "categories": sorted(list(df["category"].unique())),
        "departments": sorted(list(df["department"].unique())),
        "severities": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        "accuracies": {
            "category": round(float(cat_acc), 4),
            "department": round(float(dept_acc), 4),
            "severity": round(float(sev_acc), 4)
        }
    }
    
    # Save artifacts
    joblib.dump(cat_pipeline, os.path.join(MODEL_DIR, "category_model.joblib"))
    joblib.dump(dept_pipeline, os.path.join(MODEL_DIR, "department_model.joblib"))
    joblib.dump(sev_pipeline, os.path.join(MODEL_DIR, "severity_model.joblib"))
    joblib.dump(res_pipeline, os.path.join(MODEL_DIR, "resolution_model.joblib"))
    joblib.dump(metadata, os.path.join(MODEL_DIR, "metadata.joblib"))
    joblib.dump(data, os.path.join(MODEL_DIR, "historical_corpus.joblib"))
    
    print(f"[OK] Models successfully trained on {len(df)} samples!")
    print(f"Accuracies: Category: {cat_acc:.2%}, Dept: {dept_acc:.2%}, Severity: {sev_acc:.2%}")
    return metadata

if __name__ == "__main__":
    train_and_save_models()
