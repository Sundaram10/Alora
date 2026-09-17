import io
import base64
import numpy as np
import torch
from PIL import Image, ImageStat, ImageFilter
from typing import Dict, Any

# Lazy-loaded CLIP Zero-Shot Vision Model for instant inference
_clip_model = None
_clip_processor = None

def get_clip_engine():
    global _clip_model, _clip_processor
    if _clip_model is None:
        try:
            from transformers import CLIPProcessor, CLIPModel
            model_id = "openai/clip-vit-base-patch32"
            _clip_model = CLIPModel.from_pretrained(model_id)
            _clip_processor = CLIPProcessor.from_pretrained(model_id)
            _clip_model.eval()
        except Exception as e:
            print(f"[WARN] CLIP Vision Model could not be initialized: {e}")
            _clip_model = False
    return _clip_model, _clip_processor

class ImageAnomalyEngine:
    @staticmethod
    def analyze_image(base64_str: str) -> Dict[str, Any]:
        """
        Analyzes an uploaded image for fake/synthetic detection, digital screenshots/documents,
        personal selfies, vehicle/gas station photos, uniform blank image anomalies,
        and visual authenticity/relevance scoring for Smart Campus complaints.
        """
        if not base64_str or not isinstance(base64_str, str):
            return {
                "is_authentic": True,
                "authenticity_score": 100.0,
                "status": "NO_IMAGE_PROVIDED",
                "summary": "No image provided for anomaly analysis.",
                "detected_anomalies": [],
                "metrics": {}
            }

        try:
            if "," in base64_str:
                base64_str = base64_str.split(",")[1]

            img_bytes = base64.b64decode(base64_str)
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            
            w, h = img.size
            arr = np.array(img)
            total_pixels = w * h
            
            # 1. Color Palette Quantization & Background Dominance (Detects UI screens, tables, flat documents)
            quant = img.quantize(colors=16)
            q_arr = np.array(quant)
            counts = np.bincount(q_arr.flatten())
            top1_color_ratio = float(np.max(counts) / total_pixels)
            top3_color_ratio = float(np.sum(np.sort(counts)[-3:]) / total_pixels)

            # 2. Text/Document Binarization Contrast
            gray = np.mean(arr, axis=2)
            binarization_ratio = float(np.sum((gray < 50) | (gray > 200)) / total_pixels)

            # 3. Saturation & Grayscale Ratio
            r, g, b = arr[:,:,0].astype(float), arr[:,:,1].astype(float), arr[:,:,2].astype(float)
            max_c = np.maximum(np.maximum(r, g), b)
            min_c = np.minimum(np.minimum(r, g), b)
            sat = np.where(max_c == 0, 0, (max_c - min_c) / (max_c + 1e-5))
            low_sat_ratio = float(np.sum(sat < 0.15) / total_pixels)

            # 4. Color Histogram Entropy
            hist = img.histogram()
            total_hist_vals = total_pixels * 3
            probs = [c / total_hist_vals for c in hist if c > 0]
            entropy = -sum(p * np.log2(p) for p in probs)

            # 5. High Frequency Spectrum & Laplacian Variance
            gray_img = img.convert("L")
            laplacian = gray_img.filter(ImageFilter.Kernel((3, 3), [-1, -1, -1, -1, 8, -1, -1, -1, -1], 1, 0))
            stat = ImageStat.Stat(laplacian)
            lap_var = stat.var[0]

            # 6. Luminance Statistics & ELA Re-compression Variance
            brightness_avg = float(np.mean(arr))
            brightness_std = float(np.std(arr))
            
            ela_buf = io.BytesIO()
            img.save(ela_buf, format="JPEG", quality=90)
            ela_buf.seek(0)
            ela_img = Image.open(ela_buf).convert("RGB")
            ela_arr = np.array(ela_img)
            ela_diff = np.abs(arr.astype(float) - ela_arr.astype(float))
            ela_mean_diff = float(np.mean(ela_diff))

            # 7. CLIP Zero-Shot Vision Relevance & Content Classifier
            clip_model, clip_processor = get_clip_engine()
            clip_probs = {}
            is_irrelevant_photo = False
            irrelevant_reason = ""

            if clip_model and clip_processor:
                labels = [
                    "a photo of a campus facility issue or physical damage like broken chair, leaking pipe, damaged wall, cracked floor, broken light, or trash",
                    "a photo of motorcycles, cars, vehicles, or gas station",
                    "a selfie portrait of people or personal photo posing outdoors",
                    "a screenshot of a digital screen, table, or paper document"
                ]
                inputs = clip_processor(text=labels, images=img, return_tensors="pt", padding=True)
                with torch.no_grad():
                    outputs = clip_model(**inputs)
                    probs_list = outputs.logits_per_image.softmax(dim=1).squeeze().tolist()
                
                issue_prob = probs_list[0]
                vehicle_prob = probs_list[1]
                selfie_prob = probs_list[2]
                doc_prob = probs_list[3]

                clip_probs = {
                    "campus_issue_prob": round(issue_prob * 100, 1),
                    "vehicle_prob": round(vehicle_prob * 100, 1),
                    "selfie_prob": round(selfie_prob * 100, 1),
                    "document_prob": round(doc_prob * 100, 1)
                }

                if vehicle_prob > 0.40 or selfie_prob > 0.50 or (vehicle_prob + selfie_prob) > 0.60:
                    if issue_prob < 0.25:
                        is_irrelevant_photo = True
                        if vehicle_prob > selfie_prob:
                            irrelevant_reason = f"Detected motorcycle/vehicle or gas station photo ({vehicle_prob*100:.1f}%)"
                        else:
                            irrelevant_reason = f"Detected personal selfie/portrait photo ({selfie_prob*100:.1f}%)"

            # Rule-based Anomaly Scoring & Classification
            anomalies = []
            authenticity = 100.0

            # Anomaly Rule 1: Digital Screenshot, UI Graphics, or Document Table
            is_screenshot_or_doc = (
                top3_color_ratio > 0.45 or
                (binarization_ratio > 0.55 and low_sat_ratio > 0.50) or
                binarization_ratio > 0.75
            )
            if is_screenshot_or_doc:
                anomalies.append("DIGITAL_SCREENSHOT_OR_DOCUMENT")
                authenticity -= 86.2  # Drops score to ~13.8%
            
            # Anomaly Rule 2: Irrelevant Photo (Selfies, Motorbikes, Gas Station, Off-Topic)
            elif is_irrelevant_photo:
                anomalies.append("IRRELEVANT_NON_CAMPUS_ISSUE_PHOTO")
                authenticity -= 86.2  # Drops score to ~13.8%

            # Anomaly Rule 3: Solid color or uniform blank image
            if brightness_std < 8.0 or entropy < 2.5:
                anomalies.append("BLANK_OR_UNIFORM_SOLID_IMAGE")
                authenticity -= 75.0
            
            # Anomaly Rule 4: Out of focus / featureless blur
            elif lap_var < 8.0:
                anomalies.append("EXTREMELY_BLURRED_FEATURELESS")
                authenticity -= 45.0

            # Anomaly Rule 5: Digital synthetic noise / manipulation
            if lap_var > 9000.0 or ela_mean_diff > 35.0:
                anomalies.append("DIGITAL_NOISE_OR_COMPRESSION_TAMPERING")
                authenticity -= 45.0

            # Anomaly Rule 6: Extreme dark or blown-out white image
            if brightness_avg < 15.0:
                anomalies.append("EXTREME_UNDEREXPOSURE_BLACKOUT")
                authenticity -= 30.0
            elif brightness_avg > 245.0:
                anomalies.append("EXTREME_OVEREXPOSURE_WHITEOUT")
                authenticity -= 30.0

            authenticity_score = round(max(0.0, min(100.0, authenticity)), 1)
            is_authentic = authenticity_score >= 60.0

            if is_authentic:
                status = "AUTHENTIC_CAMPUS_PHOTO"
                summary = "Real physical campus defect photo verified by AI Anomaly Shield."
            elif "DIGITAL_SCREENSHOT_OR_DOCUMENT" in anomalies:
                status = "ANOMALOUS_SCREENSHOT_OR_DOCUMENT"
                summary = "⚠️ Screenshot or Text Document Detected - Please upload a photo of the actual physical issue on campus."
            elif "IRRELEVANT_NON_CAMPUS_ISSUE_PHOTO" in anomalies:
                status = "ANOMALOUS_IRRELEVANT_PHOTO"
                summary = f"⚠️ Irrelevant Issue Photo Detected - {irrelevant_reason}. Please upload a photo showing the campus maintenance problem."
            else:
                status = "ANOMALOUS_OR_SYNTHETIC_IMAGE"
                summary = f"⚠️ Image Anomaly Detected: {', '.join(anomalies)}."

            return {
                "is_authentic": is_authentic,
                "authenticity_score": authenticity_score,
                "status": status,
                "summary": summary,
                "detected_anomalies": anomalies,
                "metrics": {
                    "dimensions": f"{w}x{h}",
                    "top3_color_ratio": round(top3_color_ratio, 3),
                    "binarization_ratio": round(binarization_ratio, 3),
                    "low_sat_ratio": round(low_sat_ratio, 3),
                    "histogram_entropy": round(float(entropy), 2),
                    "laplacian_variance": round(float(lap_var), 2),
                    "color_stddev": round(float(brightness_std), 2),
                    "ela_mean_diff": round(float(ela_mean_diff), 2),
                    **clip_probs
                }
            }

        except Exception as e:
            return {
                "is_authentic": False,
                "authenticity_score": 0.0,
                "status": "CORRUPTED_IMAGE_DATA",
                "summary": f"Could not process image data: {str(e)}",
                "detected_anomalies": ["CORRUPTED_DATA"],
                "metrics": {}
            }


