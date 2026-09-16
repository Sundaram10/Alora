package com.alora.service;

import com.alora.dto.AuthDTO;
import com.alora.model.Department;
import com.alora.model.Role;
import com.alora.model.User;
import com.alora.repository.DepartmentRepository;
import com.alora.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public UserService(UserRepository userRepository, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    public User register(AuthDTO.RegisterRequest request) {
        if (userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword()); // simple password storage for demo
        user.setRole(request.getRole() != null ? request.getRole() : Role.STUDENT);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCampusUnit(request.getCampusUnit());

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId()).ifPresent(user::setDepartment);
        }

        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.getPasswordHash().equals(password)) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN);
    }

    public List<User> getTechniciansByDepartment(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return userRepository.findByRoleAndDepartment(Role.TECHNICIAN, dept);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
