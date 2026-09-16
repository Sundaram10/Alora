package com.alora.controller;

import com.alora.service.MLServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class MLProxyController {

    private final MLServiceClient mlServiceClient;

    public MLProxyController(MLServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    @PostMapping("/check-duplicate")
    public ResponseEntity<Map<String, Object>> checkDuplicate(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("title", "");
        String description = (String) payload.getOrDefault("description", "");
        String building = (String) payload.getOrDefault("location_building", "");
        String floor = (String) payload.getOrDefault("location_floor", "");
        String room = (String) payload.getOrDefault("location_room", "");

        Map<String, Object> result = mlServiceClient.checkDuplicate(title, description, building, floor, room);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/retrain")
    public ResponseEntity<Map<String, Object>> retrain() {
        return ResponseEntity.ok(mlServiceClient.retrain());
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(mlServiceClient.getMetrics());
    }
}
