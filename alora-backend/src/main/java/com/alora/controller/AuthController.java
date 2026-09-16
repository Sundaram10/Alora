package com.alora.controller;

import com.alora.dto.AuthDTO;
import com.alora.model.User;
import com.alora.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest req) {
        try {
            User user = userService.login(req.getEmail(), req.getPassword());
            String token = "alora-jwt-" + UUID.randomUUID().toString();
            return ResponseEntity.ok(AuthDTO.AuthResponse.fromUser(user, token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest req) {
        try {
            User user = userService.register(req);
            String token = "alora-jwt-" + UUID.randomUUID().toString();
            return ResponseEntity.ok(AuthDTO.AuthResponse.fromUser(user, token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<User>> getTechnicians(@RequestParam(required = false) Long departmentId) {
        if (departmentId != null) {
            return ResponseEntity.ok(userService.getTechniciansByDepartment(departmentId));
        }
        return ResponseEntity.ok(userService.getTechnicians());
    }
}
