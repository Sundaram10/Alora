package com.alora.dto;

import com.alora.model.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private Long assignedTechnicianId;
    private String resolutionNotes;
    private Double actualResolutionHours;

    public StatusUpdateRequest() {}

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public Long getAssignedTechnicianId() { return assignedTechnicianId; }
    public void setAssignedTechnicianId(Long assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public Double getActualResolutionHours() { return actualResolutionHours; }
    public void setActualResolutionHours(Double actualResolutionHours) { this.actualResolutionHours = actualResolutionHours; }
}
