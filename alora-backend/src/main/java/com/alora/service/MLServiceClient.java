package com.alora.service;

import com.alora.dto.MLPredictResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

@Service
public class MLServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final boolean mlEnabled;

    public MLServiceClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${alora.ml-service.base-url:http://127.0.0.1:8001}") String baseUrl,
            @Value("${alora.ml-service.enabled:true}") boolean mlEnabled
    ) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(6))
                .build();
        this.baseUrl = baseUrl;
        this.mlEnabled = mlEnabled;
    }

    public MLPredictResponseDTO predict(String title, String description, String building, String floor, String room, Long userId) {
        if (!mlEnabled) {
            return generateRuleBasedFallback(title, description, building);
        }

        try {
            String url = baseUrl + "/api/ml/predict";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("title", title);
            body.put("description", description);
            body.put("location_building", building);
            body.put("location_floor", floor);
            body.put("location_room", room);
            body.put("user_id", userId);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            return restTemplate.postForObject(url, entity, MLPredictResponseDTO.class);
        } catch (Exception e) {
            System.err.println("⚠️ ML Service call failed (" + e.getMessage() + "). Applying intelligent rule-based triage fallback.");
            return generateRuleBasedFallback(title, description, building);
        }
    }

    public Map<String, Object> checkDuplicate(String title, String description, String building, String floor, String room) {
        try {
            String url = baseUrl + "/api/ml/check-duplicate";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("title", title);
            body.put("description", description);
            body.put("location_building", building);
            body.put("location_floor", floor);
            body.put("location_room", room);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            return restTemplate.postForObject(url, entity, Map.class);
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("is_duplicate", false);
            fallback.put("highest_similarity", 0.0);
            return fallback;
        }
    }

    public Map<String, Object> retrain() {
        try {
            String url = baseUrl + "/api/ml/retrain";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(new HashMap<>(), headers);
            return restTemplate.postForObject(url, entity, Map.class);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "ERROR");
            err.put("message", "Could not reach ML service for retraining: " + e.getMessage());
            return err;
        }
    }

    public Map<String, Object> getMetrics() {
        try {
            String url = baseUrl + "/api/ml/metrics";
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("model_status", "OFFLINE");
            err.put("error", e.getMessage());
            return err;
        }
    }

    private MLPredictResponseDTO generateRuleBasedFallback(String title, String description, String building) {
        String combined = (title + " " + description).toLowerCase();

        String category = "Infrastructure";
        String department = "Civil Works & Carpentry";
        String severity = "MEDIUM";
        double hours = 8.0;

        if (combined.contains("spark") || combined.contains("electric") || combined.contains("light") || combined.contains("mcb") || combined.contains("fan") || combined.contains("power")) {
            category = "Electrical";
            department = "Electrical Maintenance";
            severity = combined.contains("spark") || combined.contains("burn") ? "CRITICAL" : "HIGH";
            hours = 3.0;
        } else if (combined.contains("leak") || combined.contains("pipe") || combined.contains("water") || combined.contains("tap") || combined.contains("flush") || combined.contains("drain")) {
            category = "Plumbing";
            department = "Plumbing & Water Works";
            severity = combined.contains("flood") || combined.contains("burst") ? "CRITICAL" : "HIGH";
            hours = 3.5;
        } else if (combined.contains("wifi") || combined.contains("network") || combined.contains("internet") || combined.contains("lan") || combined.contains("projector") || combined.contains("server")) {
            category = "IT & Network";
            department = "IT & Network Operations";
            severity = combined.contains("down") || combined.contains("exam") ? "HIGH" : "MEDIUM";
            hours = 2.5;
        } else if (combined.contains("ac") || combined.contains("air condition") || combined.contains("cooling") || combined.contains("duct")) {
            category = "HVAC";
            department = "HVAC & Climate Control";
            severity = combined.contains("server") ? "CRITICAL" : "HIGH";
            hours = 4.0;
        } else if (combined.contains("clean") || combined.contains("trash") || combined.contains("garbage") || combined.contains("spill") || combined.contains("mud")) {
            category = "Sanitation";
            department = "Housekeeping & Sanitation";
            severity = combined.contains("spill") ? "HIGH" : "MEDIUM";
            hours = 2.0;
        }

        MLPredictResponseDTO dto = new MLPredictResponseDTO();
        dto.setPredictedCategory(category);
        dto.setCategoryConfidence(0.85);
        dto.setPredictedDepartment(department);
        dto.setDepartmentConfidence(0.88);
        dto.setPredictedSeverity(severity);
        dto.setSeverityConfidence(0.90);
        dto.setEstimatedResolutionHours(hours);
        dto.setModelVersion("v1.0.0-fallback");

        MLPredictResponseDTO.DuplicateCheckDTO dup = new MLPredictResponseDTO.DuplicateCheckDTO();
        dup.setIsDuplicate(false);
        dup.setHighestSimilarity(0.0);
        dto.setDuplicateCheck(dup);

        MLPredictResponseDTO.RecommendationDTO rec = new MLPredictResponseDTO.RecommendationDTO();
        rec.setPriorityLevel("P2 - HIGH PRIORITY");
        rec.setActionChecklist(Arrays.asList("Inspect location", "Isolate issue", "Apply corrective repair", "Test and verify"));
        rec.setSuggestedTools(Arrays.asList("Basic technician toolkit", "Inspection lamp"));
        rec.setSuggestedTechnicianRole("Duty Technician");
        dto.setRecommendation(rec);

        return dto;
    }
}
