package com.alora.repository;

import com.alora.model.Department;
import com.alora.model.Role;
import com.alora.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findByRole(Role role);
    List<User> findByDepartment(Department department);
    List<User> findByRoleAndDepartment(Role role, Department department);
}
