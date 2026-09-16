package com.alora.dto;

import com.alora.model.Role;
import com.alora.model.User;

public class AuthDTO {

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private Role role = Role.STUDENT;
        private Long departmentId;
        private String phoneNumber;
        private String campusUnit;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getCampusUnit() { return campusUnit; }
        public void setCampusUnit(String campusUnit) { this.campusUnit = campusUnit; }
    }

    public static class AuthResponse {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private Long departmentId;
        private String departmentName;
        private String token;

        public static AuthResponse fromUser(User user, String token) {
            AuthResponse res = new AuthResponse();
            res.setId(user.getId());
            res.setFullName(user.getFullName());
            res.setEmail(user.getEmail());
            res.setRole(user.getRole().name());
            if (user.getDepartment() != null) {
                res.setDepartmentId(user.getDepartment().getId());
                res.setDepartmentName(user.getDepartment().getName());
            }
            res.setToken(token);
            return res;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
