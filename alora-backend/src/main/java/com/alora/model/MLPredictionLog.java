package com.alora.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ml_predictions")
public class MLPredictionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "predicted_category", nullable = false, length = 80)
    private String predictedCategory;

    @Column(name = "category_confidence", nullable = false)
    private Double categoryConfidence;

    @Column(name = "predicted_department", nullable = false, length = 100)
    private String predictedDepartment;

    @Column(name = "department_confidence", nullable = false)
    private Double departmentConfidence;

    @Column(name = "predicted_severity", nullable = false, length = 20)
    private String predictedSeverity;

    @Column(name = "severity_confidence", nullable = false)
    private Double severityConfidence;

    @Column(name = "predicted_resolution_hours", nullable = false)
    private Double predictedResolutionHours;

    @Column(name = "is_duplicate_flag")
    private Boolean isDuplicateFlag = false;

    @Column(name = "duplicate_similarity_score")
    private Double duplicateSimilarityScore = 0.0;

    @Column(name = "matched_complaint_id")
    private Long matchedComplaintId;

    @Column(name = "action_recommendations", columnDefinition = "TEXT")
    private String actionRecommendations;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MLPredictionLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

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

    public Double getPredictedResolutionHours() { return predictedResolutionHours; }
    public void setPredictedResolutionHours(Double predictedResolutionHours) { this.predictedResolutionHours = predictedResolutionHours; }

    public Boolean getIsDuplicateFlag() { return isDuplicateFlag; }
    public void setIsDuplicateFlag(Boolean duplicateFlag) { isDuplicateFlag = duplicateFlag; }

    public Double getDuplicateSimilarityScore() { return duplicateSimilarityScore; }
    public void setDuplicateSimilarityScore(Double duplicateSimilarityScore) { this.duplicateSimilarityScore = duplicateSimilarityScore; }

    public Long getMatchedComplaintId() { return matchedComplaintId; }
    public void setMatchedComplaintId(Long matchedComplaintId) { this.matchedComplaintId = matchedComplaintId; }

    public String getActionRecommendations() { return actionRecommendations; }
    public void setActionRecommendations(String actionRecommendations) { this.actionRecommendations = actionRecommendations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
