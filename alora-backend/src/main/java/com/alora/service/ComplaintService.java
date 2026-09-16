package com.alora.service;

import com.alora.dto.ComplaintRequest;
import com.alora.dto.ComplaintResponse;
import com.alora.dto.MLPredictResponseDTO;
import com.alora.dto.StatusUpdateRequest;
import com.alora.model.*;
import com.alora.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final MLPredictionLogRepository mlPredictionLogRepository;
    private final MLServiceClient mlServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            MLPredictionLogRepository mlPredictionLogRepository,
            MLServiceClient mlServiceClient
    ) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.mlPredictionLogRepository = mlPredictionLogRepository;
        this.mlServiceClient = mlServiceClient;
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLocationBuilding(request.getLocationBuilding());
        complaint.setLocationFloor(request.getLocationFloor());
        complaint.setLocationRoom(request.getLocationRoom());
        complaint.setTrackingNumber(generateTrackingNumber());
        complaint.setStatus(ComplaintStatus.PENDING);

        // 1. Check if user explicitly selected a department
        Department selectedDept = null;
        if (request.getDepartmentId() != null) {
            selectedDept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        // 2. Invoke Python ML AI Service
        MLPredictResponseDTO mlResult = mlServiceClient.predict(
                request.getTitle(),
                request.getDescription(),
                request.getLocationBuilding(),
                request.getLocationFloor(),
                request.getLocationRoom(),
                user.getId()
        );

        if (mlResult != null) {
            if (request.getCategory() != null && !request.getCategory().isBlank()) {
                complaint.setCategory(request.getCategory());
            } else {
                complaint.setCategory(mlResult.getPredictedCategory());
            }
            
            try {
                complaint.setSeverity(Severity.valueOf(mlResult.getPredictedSeverity().toUpperCase()));
            } catch (Exception e) {
                complaint.setSeverity(Severity.MEDIUM);
            }

            complaint.setEstimatedResolutionHours(mlResult.getEstimatedResolutionHours());

            // Check if flagged as duplicate
            if (mlResult.getDuplicateCheck() != null && Boolean.TRUE.equals(mlResult.getDuplicateCheck().getIsDuplicate())) {
                complaint.setIsDuplicate(true);
                Long dupId = mlResult.getDuplicateCheck().getMatchedComplaint() != null
                        ? mlResult.getDuplicateCheck().getMatchedComplaint().getComplaintId() : null;
                if (dupId != null) {
                    complaintRepository.findById(dupId).ifPresent(complaint::setDuplicateOf);
                }
            }

            // Assign Department: manual selection takes precedence; otherwise ML predicted department
            if (selectedDept != null) {
                complaint.setDepartment(selectedDept);
            } else {
                Optional<Department> deptOpt = departmentRepository.findByNameIgnoreCase(mlResult.getPredictedDepartment());
                if (deptOpt.isPresent()) {
                    complaint.setDepartment(deptOpt.get());
                } else {
                    List<Department> allDepts = departmentRepository.findAll();
                    if (!allDepts.isEmpty()) {
                        complaint.setDepartment(allDepts.get(0));
                    }
                }
            }

            // Auto-assign available technician in the department
            if (complaint.getDepartment() != null) {
                List<User> technicians = userRepository.findByRoleAndDepartment(Role.TECHNICIAN, complaint.getDepartment());
                if (!technicians.isEmpty()) {
                    complaint.setAssignedTechnician(technicians.get(0));
                    complaint.setStatus(ComplaintStatus.ASSIGNED);
                } else {
                    complaint.setStatus(ComplaintStatus.AI_TRIAGED);
                }
            }
        } else {
            // Fallback when ML service is offline
            if (selectedDept != null) {
                complaint.setDepartment(selectedDept);
            }
            complaint.setCategory(request.getCategory() != null ? request.getCategory() : "General");
            complaint.setSeverity(Severity.MEDIUM);
            complaint.setEstimatedResolutionHours(4.0);
            if (complaint.getDepartment() != null) {
                List<User> technicians = userRepository.findByRoleAndDepartment(Role.TECHNICIAN, complaint.getDepartment());
                if (!technicians.isEmpty()) {
                    complaint.setAssignedTechnician(technicians.get(0));
                    complaint.setStatus(ComplaintStatus.ASSIGNED);
                }
            }
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        // 2. Persist ML Prediction Log
        if (mlResult != null) {
            try {
                MLPredictionLog log = new MLPredictionLog();
                log.setComplaint(savedComplaint);
                log.setPredictedCategory(mlResult.getPredictedCategory());
                log.setCategoryConfidence(mlResult.getCategoryConfidence());
                log.setPredictedDepartment(mlResult.getPredictedDepartment());
                log.setDepartmentConfidence(mlResult.getDepartmentConfidence());
                log.setPredictedSeverity(mlResult.getPredictedSeverity());
                log.setSeverityConfidence(mlResult.getSeverityConfidence());
                log.setPredictedResolutionHours(mlResult.getEstimatedResolutionHours());

                if (mlResult.getDuplicateCheck() != null) {
                    log.setIsDuplicateFlag(mlResult.getDuplicateCheck().getIsDuplicate());
                    log.setDuplicateSimilarityScore(mlResult.getDuplicateCheck().getHighestSimilarity());
                }

                if (mlResult.getRecommendation() != null) {
                    log.setActionRecommendations(objectMapper.writeValueAsString(mlResult.getRecommendation()));
                }

                mlPredictionLogRepository.save(log);
            } catch (Exception e) {
                System.err.println("Could not save ML log: " + e.getMessage());
            }
        }

        return ComplaintResponse.fromEntity(savedComplaint);
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(ComplaintResponse::fromEntity).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getComplaintsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return complaintRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(ComplaintResponse::fromEntity).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getComplaintsByDepartment(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return complaintRepository.findByDepartmentOrderByCreatedAtDesc(dept)
                .stream().map(ComplaintResponse::fromEntity).collect(Collectors.toList());
    }

    public List<ComplaintResponse> getComplaintsByTechnician(Long technicianId) {
        User tech = userRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));
        return complaintRepository.findByAssignedTechnicianOrderByCreatedAtDesc(tech)
                .stream().map(ComplaintResponse::fromEntity).collect(Collectors.toList());
    }

    public Optional<ComplaintResponse> getComplaintByTrackingNumber(String trackingNumber) {
        return complaintRepository.findByTrackingNumber(trackingNumber)
                .map(ComplaintResponse::fromEntity);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setStatus(request.getStatus());

        if (request.getAssignedTechnicianId() != null) {
            userRepository.findById(request.getAssignedTechnicianId())
                    .ifPresent(complaint::setAssignedTechnician);
        }

        if (request.getResolutionNotes() != null) {
            complaint.setResolutionNotes(request.getResolutionNotes());
        }

        if (request.getStatus() == ComplaintStatus.RESOLVED || request.getStatus() == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(LocalDateTime.now());
            if (request.getActualResolutionHours() != null) {
                complaint.setActualResolutionHours(request.getActualResolutionHours());
            } else if (complaint.getCreatedAt() != null) {
                Duration duration = Duration.between(complaint.getCreatedAt(), LocalDateTime.now());
                double hours = Math.round((duration.toMinutes() / 60.0) * 10.0) / 10.0;
                complaint.setActualResolutionHours(Math.max(0.5, hours));
            }
        }

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(saved);
    }

    private String generateTrackingNumber() {
        String year = DateTimeFormatter.ofPattern("yyyy").format(LocalDateTime.now());
        int randomNum = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "ALR-" + year + "-" + randomNum;
    }
}
