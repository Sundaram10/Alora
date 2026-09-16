package com.alora.controller;

import com.alora.dto.FeedbackRequest;
import com.alora.model.Complaint;
import com.alora.model.Feedback;
import com.alora.model.User;
import com.alora.repository.ComplaintRepository;
import com.alora.repository.FeedbackRepository;
import com.alora.repository.UserRepository;
import com.alora.service.MLServiceClient;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final MLServiceClient mlServiceClient;

    public FeedbackController(
            FeedbackRepository feedbackRepository,
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            MLServiceClient mlServiceClient
    ) {
        this.feedbackRepository = feedbackRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.mlServiceClient = mlServiceClient;
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody FeedbackRequest req) {
        Complaint complaint = complaintRepository.findById(req.getComplaintId())
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + req.getComplaintId()));

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + req.getUserId()));

        Feedback feedback = new Feedback(complaint, user, req.getRating(), req.getComments(), req.getSatisfactionLevel());
        Feedback saved = feedbackRepository.save(feedback);

        // Optionally trigger retraining in background if feedback reaches threshold
        new Thread(() -> {
            try {
                mlServiceClient.retrain();
            } catch (Exception e) {
                // Ignore background training errors
            }
        }).start();

        return ResponseEntity.ok(saved);
    }
}
