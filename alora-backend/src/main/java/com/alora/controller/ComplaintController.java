package com.alora.controller;

import com.alora.dto.ComplaintRequest;
import com.alora.dto.ComplaintResponse;
import com.alora.dto.StatusUpdateRequest;
import com.alora.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<?> createComplaint(@Valid @RequestBody ComplaintRequest request) {
        try {
            ComplaintResponse response = complaintService.createComplaint(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getComplaints(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long technicianId
    ) {
        if (userId != null) {
            return ResponseEntity.ok(complaintService.getComplaintsByUser(userId));
        }
        if (departmentId != null) {
            return ResponseEntity.ok(complaintService.getComplaintsByDepartment(departmentId));
        }
        if (technicianId != null) {
            return ResponseEntity.ok(complaintService.getComplaintsByTechnician(technicianId));
        }
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<?> trackComplaint(@PathVariable String trackingNumber) {
        return complaintService.getComplaintByTrackingNumber(trackingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        try {
            ComplaintResponse response = complaintService.updateStatus(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
