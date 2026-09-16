package com.alora.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MLPredictResponseDTO {

    @JsonProperty("predicted_category")
    private String predictedCategory;

    @JsonProperty("category_confidence")
    private Double categoryConfidence;

    @JsonProperty("predicted_department")
    private String predictedDepartment;

    @JsonProperty("department_confidence")
    private Double departmentConfidence;

    @JsonProperty("predicted_severity")
    private String predictedSeverity;

    @JsonProperty("severity_confidence")
    private Double severityConfidence;

    @JsonProperty("estimated_resolution_hours")
    private Double estimatedResolutionHours;

    @JsonProperty("duplicate_check")
    private DuplicateCheckDTO duplicateCheck;

    @JsonProperty("recommendation")
    private RecommendationDTO recommendation;

    @JsonProperty("model_version")
    private String modelVersion;

    public static class DuplicateCheckDTO {
        @JsonProperty("is_duplicate")
        private Boolean isDuplicate;

        @JsonProperty("highest_similarity")
        private Double highestSimilarity;

        @JsonProperty("matched_complaint")
        private MatchedComplaintDTO matchedComplaint;

        public Boolean getIsDuplicate() { return isDuplicate; }
        public void setIsDuplicate(Boolean duplicate) { isDuplicate = duplicate; }

        public Double getHighestSimilarity() { return highestSimilarity; }
        public void setHighestSimilarity(Double highestSimilarity) { this.highestSimilarity = highestSimilarity; }

        public MatchedComplaintDTO getMatchedComplaint() { return matchedComplaint; }
        public void setMatchedComplaint(MatchedComplaintDTO matchedComplaint) { this.matchedComplaint = matchedComplaint; }
    }

    public static class MatchedComplaintDTO {
        @JsonProperty("complaint_id")
        private Long complaintId;

        @JsonProperty("tracking_number")
        private String trackingNumber;

        @JsonProperty("title")
        private String title;

        @JsonProperty("location")
        private String location;

        @JsonProperty("similarity_score")
        private Double similarityScore;

        public Long getComplaintId() { return complaintId; }
        public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public Double getSimilarityScore() { return similarityScore; }
        public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    }

    public static class RecommendationDTO {
        @JsonProperty("priority_level")
        private String priorityLevel;

        @JsonProperty("action_checklist")
        private List<String> actionChecklist;

        @JsonProperty("suggested_tools")
        private List<String> suggestedTools;

        @JsonProperty("safety_notes")
        private String safetyNotes;

        @JsonProperty("suggested_technician_role")
        private String suggestedTechnicianRole;

        public String getPriorityLevel() { return priorityLevel; }
        public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

        public List<String> getActionChecklist() { return actionChecklist; }
        public void setActionChecklist(List<String> actionChecklist) { this.actionChecklist = actionChecklist; }

        public List<String> getSuggestedTools() { return suggestedTools; }
        public void setSuggestedTools(List<String> suggestedTools) { this.suggestedTools = suggestedTools; }

        public String getSafetyNotes() { return safetyNotes; }
        public void setSafetyNotes(String safetyNotes) { this.safetyNotes = safetyNotes; }

        public String getSuggestedTechnicianRole() { return suggestedTechnicianRole; }
        public void setSuggestedTechnicianRole(String suggestedTechnicianRole) { this.suggestedTechnicianRole = suggestedTechnicianRole; }
    }

    public String getPredictedCategory() { return predictedCategory; }
    public void setPredictedCategory(String predictedCategory) { this.predictedCategory = predictedCategory; }

    public Double getCategoryConfidence() { return categoryConfidence; }
    public void setCategoryConfidence(Double categoryConfidence) { this.categoryConfidence = categoryConfidence; }

    public String getPredictedDepartment() { return predictedDepartment; }
    public void setPredictedDepartment(String predictedDepartment) { this.predictedDepartment = predictedDepartment; }

    public Double getDepartmentConfidence() { return departmentConfidence; }
    public void setDepartmentConfidence(Double departmentConfidence) { this.departmentConfidence = departmentConfidence; }

    public String getPredictedSeverity() { return predictedSeverity; }
    public void setPredictedSeverity(String predictedSeverity) { this.predictedSeverity = predictedSeverity; }

    public Double getSeverityConfidence() { return severityConfidence; }
    public void setSeverityConfidence(Double severityConfidence) { this.severityConfidence = severityConfidence; }

    public Double getEstimatedResolutionHours() { return estimatedResolutionHours; }
    public void setEstimatedResolutionHours(Double estimatedResolutionHours) { this.estimatedResolutionHours = estimatedResolutionHours; }

    public DuplicateCheckDTO getDuplicateCheck() { return duplicateCheck; }
    public void setDuplicateCheck(DuplicateCheckDTO duplicateCheck) { this.duplicateCheck = duplicateCheck; }

    public RecommendationDTO getRecommendation() { return recommendation; }
    public void setRecommendation(RecommendationDTO recommendation) { this.recommendation = recommendation; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
