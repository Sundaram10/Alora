package com.alora.repository;

import com.alora.model.Complaint;
import com.alora.model.ComplaintStatus;
import com.alora.model.Department;
import com.alora.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByTrackingNumber(String trackingNumber);

    List<Complaint> findByUserOrderByCreatedAtDesc(User user);

    List<Complaint> findByDepartmentOrderByCreatedAtDesc(Department department);

    List<Complaint> findByAssignedTechnicianOrderByCreatedAtDesc(User technician);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatus(ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.isDuplicate = true")
    long countDuplicates();

    @Query("SELECT AVG(c.actualResolutionHours) FROM Complaint c WHERE c.status = 'RESOLVED' AND c.actualResolutionHours IS NOT NULL")
    Double findAverageResolutionHours();

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countComplaintsByCategory();

    @Query("SELECT c.department.name, COUNT(c) FROM Complaint c WHERE c.department IS NOT NULL GROUP BY c.department.name")
    List<Object[]> countComplaintsByDepartment();
}
