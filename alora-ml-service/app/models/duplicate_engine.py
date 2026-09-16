import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "saved_models")

class DuplicateDetectionEngine:
    def __init__(self):
        self.corpus = []
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        self.tfidf_matrix = None
        self.reload()

    def reload(self):
        corpus_path = os.path.join(MODEL_DIR, "historical_corpus.joblib")
        if os.path.exists(corpus_path):
            self.corpus = joblib.load(corpus_path)
            if self.corpus:
                texts = [
                    f"{item.get('title', '')} {item.get('description', '')}"
                    for item in self.corpus
                ]
                self.tfidf_matrix = self.vectorizer.fit_transform(texts)
        else:
            self.corpus = []
            self.tfidf_matrix = None

    def add_to_corpus(self, complaint: dict):
        self.corpus.append(complaint)
        texts = [
            f"{item.get('title', '')} {item.get('description', '')}"
            for item in self.corpus
        ]
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)

    def check_duplicate(self, title: str, description: str, building: str, floor: str = "", room: str = "", threshold: float = 0.60):
        if not self.corpus or self.tfidf_matrix is None:
            return {
                "is_duplicate": False,
                "highest_similarity": 0.0,
                "matched_complaint": None,
                "similar_complaints": []
            }

        query_text = f"{title} {description}"
        query_vec = self.vectorizer.transform([query_text])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        similar_items = []
        highest_score = 0.0
        best_match = None

        for idx, score in enumerate(similarities):
            item = self.corpus[idx]
            final_score = float(score)

            # Location proximity bonus
            item_bldg = str(item.get("location_building", "")).lower().strip()
            curr_bldg = str(building).lower().strip()
            
            if item_bldg and curr_bldg and (item_bldg in curr_bldg or curr_bldg in item_bldg):
                # 15% bonus if reported in the same building
                final_score = min(1.0, final_score + 0.15)
                
                # Further bonus if floor/room match
                item_room = str(item.get("location_room", "")).lower().strip()
                curr_room = str(room).lower().strip()
                if item_room and curr_room and item_room == curr_room:
                    final_score = min(1.0, final_score + 0.10)

            if final_score >= threshold:
                dup_info = {
                    "complaint_id": item.get("id"),
                    "tracking_number": item.get("tracking_number", f"ALR-HIST-{idx+1:04d}"),
                    "title": item.get("title", ""),
                    "location": f"{item.get('location_building', '')} {item.get('location_room', '')}".strip(),
                    "similarity_score": round(final_score, 3),
                    "status": item.get("status", "IN_PROGRESS")
                }
                similar_items.append(dup_info)

            if final_score > highest_score:
                highest_score = final_score
                best_match = {
                    "complaint_id": item.get("id"),
                    "tracking_number": item.get("tracking_number", f"ALR-HIST-{idx+1:04d}"),
                    "title": item.get("title", ""),
                    "location": f"{item.get('location_building', '')} {item.get('location_room', '')}".strip(),
                    "similarity_score": round(final_score, 3),
                    "status": item.get("status", "IN_PROGRESS")
                }

        is_dup = highest_score >= threshold
        # Sort by similarity descending
        similar_items.sort(key=lambda x: x["similarity_score"], reverse=True)

        return {
            "is_duplicate": is_dup,
            "highest_similarity": round(highest_score, 3),
            "matched_complaint": best_match if is_dup else None,
            "similar_complaints": similar_items[:3]
        }
