package com.alora.dto;

import com.alora.model.Complaint;
import java.time.LocalDateTime;

public class ComplaintResponse {

    private Long id;
    private String trackingNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private String title;
    private String description;
    private String locationBuilding;
    private String locationFloor;
    private String locationRoom;
    private String category;
    private Long departmentId;
    private String departmentName;
    private String severity;
    private String status;
    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private Double estimatedResolutionHours;
    private Double actualResolutionHours;
    private Boolean isDuplicate;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public static ComplaintResponse fromEntity(Complaint c) {
        ComplaintResponse dto = new ComplaintResponse();
        dto.setId(c.getId());
        dto.setTrackingNumber(c.getTrackingNumber());
        if (c.getUser() != null) {
            dto.setUserId(c.getUser().getId());
            dto.setUserName(c.getUser().getFullName());
            dto.setUserEmail(c.getUser().getEmail());
        }
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setLocationBuilding(c.getLocationBuilding());
        dto.setLocationFloor(c.getLocationFloor());
        dto.setLocationRoom(c.getLocationRoom());
        dto.setCategory(c.getCategory());
        if (c.getDepartment() != null) {
            dto.setDepartmentId(c.getDepartment().getId());
            dto.setDepartmentName(c.getDepartment().getName());
        }
        if (c.getSeverity() != null) {
            dto.setSeverity(c.getSeverity().name());
        }
        if (c.getStatus() != null) {
            dto.setStatus(c.getStatus().name());
        }
        if (c.getAssignedTechnician() != null) {
            dto.setAssignedTechnicianId(c.getAssignedTechnician().getId());
            dto.setAssignedTechnicianName(c.getAssignedTechnician().getFullName());
        }
        dto.setEstimatedResolutionHours(c.getEstimatedResolutionHours());
        dto.setActualResolutionHours(c.getActualResolutionHours());
        dto.setIsDuplicate(c.getIsDuplicate());
        dto.setResolutionNotes(c.getResolutionNotes());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setResolvedAt(c.getResolvedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocationBuilding() { return locationBuilding; }
    public void setLocationBuilding(String locationBuilding) { this.locationBuilding = locationBuilding; }

    public String getLocationFloor() { return locationFloor; }
    public void setLocationFloor(String locationFloor) { this.locationFloor = locationFloor; }

    public String getLocationRoom() { return locationRoom; }
    public void setLocationRoom(String locationRoom) { this.locationRoom = locationRoom; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAssignedTechnicianId() { return assignedTechnicianId; }
    public void setAssignedTechnicianId(Long assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }

    public String getAssignedTechnicianName() { return assignedTechnicianName; }
    public void setAssignedTechnicianName(String assignedTechnicianName) { this.assignedTechnicianName = assignedTechnicianName; }

    public Double getEstimatedResolutionHours() { return estimatedResolutionHours; }
    public void setEstimatedResolutionHours(Double estimatedResolutionHours) { this.estimatedResolutionHours = estimatedResolutionHours; }

    public Double getActualResolutionHours() { return actualResolutionHours; }
    public void setActualResolutionHours(Double actualResolutionHours) { this.actualResolutionHours = actualResolutionHours; }

    public Boolean getIsDuplicate() { return isDuplicate; }
    public void setIsDuplicate(Boolean duplicate) { isDuplicate = duplicate; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
